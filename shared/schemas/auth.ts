import { z } from "zod";
import { APP_ROLES } from "../constants/roles";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(APP_ROLES),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
