import rateLimit from "express-rate-limit";

//Auth limiter (STRICT)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max 5 requests per IP
  message: {
    error: "Too many login attempts. Try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//General limiter (LOOSE)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 min
  message: {
    error: "Too many requests. Please slow down."
  }
});