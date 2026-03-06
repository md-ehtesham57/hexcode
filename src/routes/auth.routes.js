import express from "express";
import { login, logout, register, check } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";


const authRoutes = express.Router();

//console.log("register =", register)
authRoutes.post("/register" , register);

authRoutes.post("/login" , login);

authRoutes.post("/logout" , authMiddleware , logout);

authRoutes.get("/check" , authMiddleware , check);


export default authRoutes;