import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password too long")
    .regex(/[A-Z]/, "Must iclude at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),

  name: z
    .string()
    .min(2, "Name too short")
    .max(50, "Name too long")
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password required")
});

