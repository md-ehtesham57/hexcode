import express from "express";
import { login, logout, register, check, refresh } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/auth.rateLimit.js";
import passport from "../config/passport.js";
//temp route
import { db } from "../libs/db.js";


const authRoutes = express.Router();

authRoutes.post("/register", authLimiter, register);

authRoutes.post("/login", authLimiter, login);

//Google OAuth Login
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//Google OAuth Callback
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login"
  }),
  (req, res) => {
    res.cookie("refreshToken", req.user.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const { accessToken } = req.user;

    res.redirect(
      `http://localhost:5173/oauth-success?token=${accessToken}`
    );
  }
);

//GitHub Login
authRoutes.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

//GitHub Callback
authRoutes.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/",
  }),
  (req, res) => {
    res.cookie("refreshToken", req.user.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const { accessToken } = req.user;

    res.redirect(
      `http://localhost:5173/oauth-success?token=${accessToken}`
    );
  }
);

authRoutes.post("/logout", authMiddleware, logout);

authRoutes.get("/check", authMiddleware, check);

authRoutes.post("/refresh", authLimiter, refresh);

//Temp routes
authRoutes.post("/ban/:userId", async (req, res) => {
  const { userId } = req.params;

  await db.user.update({
    where: { id: userId },
    data: { isBanned: true }
  });

  await db.session.deleteMany({
    where: { userId }
  });

  res.json({ success: true, message: "User banned" });
});

//Unban temp route
authRoutes.post("/unban/:userId", async (req, res) => {
  const { userId } = req.params;

  await db.user.update({
    where: { id: userId },
    data: { isBanned: false }
  });

  res.json({ success: true, message: "User unbanned" });
});


export default authRoutes;