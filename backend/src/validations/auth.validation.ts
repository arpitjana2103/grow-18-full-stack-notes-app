import { z } from "zod";
const emailFieldSchema = z.email().trim().min(1).max(254);

const passwordFieldSchema = z
    .string()
    .trim()
    .min(4)
    .max(10)
    .regex(/[A-Z]/, { message: "Must include at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must include at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must include at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must include at least one special character" });

export const registrationUserSchema = z.object({
    name: z.string().trim().min(1).max(30),
    email: emailFieldSchema,
    password: passwordFieldSchema,
});
