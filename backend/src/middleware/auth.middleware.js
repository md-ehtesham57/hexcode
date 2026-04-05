import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    //Read from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized - No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized - Invalid or expired token"
      });
    }

    //Fetch user
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    });

    if (user.isBanned) {
      return res.status(403).json({
        error: "Account banned"
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({
      message: "Error authenticating user"
    });
  }
};

export const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Forbidden - Admin access required"
    });
  }

  next();
};