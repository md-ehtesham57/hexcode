import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { apiLimiter } from "./middleware/auth.rateLimit.js";
import passport from "./config/passport.js";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:5173"];

app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(passport.initialize());

app.use("/api", apiLimiter);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello guys welcome to hexcode")
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code" , executionRoute);
app.use("/api/v1/submission" , submissionRoutes);
app.use("/api/v1/playlist" , playlistRoutes);

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})