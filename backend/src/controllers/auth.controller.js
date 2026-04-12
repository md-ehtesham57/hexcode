import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { randomUUID } from "crypto";
import { error } from "console";


export const register = async (req, res) => {

  try {
    //Validation
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0].message
      });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password.trim();
    const name = parsed.data.name.trim();

    const existingUser = await db.user.findFirst({
      where: {
        email,
        provider: "LOCAL"
      }
    })

    if (existingUser) {
      return res.status(409).json({
        error: "User already exist"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
        provider: "LOCAL"
      }
    })

    //Access Token
    const accessToken = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    //Refresh Token
    const jti = randomUUID();

    const refreshToken = jwt.sign(
      { id: newUser.id, jti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const hashedToken = await bcrypt.hash(refreshToken, 12);

    await db.session.create({
      data: {
        userId: newUser.id,
        refreshToken: hashedToken,
        jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image,
        github: newUser.github,
        website: newUser.website,
      }
    })
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Error creating a new user"
    })
  }
}

export const login = async (req, res) => {

  try {
    //Validation
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0].message
      });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password.trim();

    const user = await db.user.findFirst({
      where: {
        email,
        provider: "LOCAL"
      }
    });

    if (user?.isBanned) {
      return res.status(403).json({
        error: "Your account has been banned"
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }
    if (!user.password) {
      return res.status(400).json({
        error: "Please login using your provider."
      })
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    //Access Token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    //Refresh Token
    const jti = randomUUID();

    const refreshToken = jwt.sign(
      { id: user.id, jti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );


    //STORE SESSION (THIS WAS MISSING)
    const hashedToken = await bcrypt.hash(refreshToken, 12);

    await db.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedToken,
        jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    //Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        github: user.github,
        website: user.website,
      }
    });

  } catch (error) {
    console.error("Error login the user:", error);
    res.status(500).json({
      error: "Error login the user"
    });
  }
};

import { PrismaClient } from "@prisma/client";
import { success } from "zod";
const prisma = new PrismaClient();

export const updateProfile = async (req, res) => {
  try {
    const { github, website, profilePic } = req.body;
    const userId = req.user.id;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        github: github || "",
        website: website || "",
        image: profilePic,
      },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Prisma Update Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const logout = async (req, res) => {
  try {
    //Safety check
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    //Delete all sessions for this user
    await db.session.deleteMany({
      where: {
        userId: req.user.id
      }
    });

    //Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully"
    });

  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({
      error: "Error logging out user"
    });
  }
};

export const check = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        github: true,   
        website: true, 
        createdAt: true,
      }
    });

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: user
    })
  } catch (error) {
    console.error("Error checking user: ", error);
    res.status(500).json({
      error: "Error checking user! "
    })
  }
}

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    //Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const userId = decoded.id;

    //Find sessions for user
    const session = await db.session.findUnique({
      where: { jti: decoded.jti }
    });

    if (!session) {
      return res.status(403).json({ error: "Invalid session" });
    }

    const isMatch = await bcrypt.compare(token, session.refreshToken);

    if (!isMatch) {
      return res.status(403).json({ error: "Invalid session" });
    }

    //Check expiry
    if (Date.now() > session.expiresAt.getTime()) {
      await db.session.delete({
        where: { id: session.id }
      });
      return res.status(403).json({ error: "Session expired" });
    }

    //ROTATION: delete old session
    await db.session.delete({
      where: { id: session.id }
    });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    //Generate new tokens
    const newAccessToken = jwt.sign(
      { id: userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const jti = randomUUID();

    const newRefreshToken = jwt.sign(
      { id: userId, jti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    //Store new session
    const hashedToken = await bcrypt.hash(newRefreshToken, 12);

    await db.session.create({
      data: {
        userId,
        refreshToken: hashedToken,
        jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    //Set new cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({
      error: "Failed to refresh token"
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await db.user.findUnique({ where: { id: userId } });

    // 1. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Current password incorrect" });

    // 2. Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: "Password updated!" });
  } catch (error) {
    res.status(500).json({ error: "Server error updating password" });
  }
};

