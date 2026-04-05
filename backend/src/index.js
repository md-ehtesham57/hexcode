import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/auth.rateLimit.js";
import passport from "./config/passport.js";



import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";

dotenv.config();


const app = express();
app.use(passport.initialize());

app.use("/api", apiLimiter);
app.use(express.json());
app.use(cookieParser());

app.get("/" , (req, res) => {
    res.send("Hello guys welcome to hexcode")
})

app.use("/api/v1/auth" , authRoutes);
app.use("/api/v1/problems" , problemRoutes);

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})