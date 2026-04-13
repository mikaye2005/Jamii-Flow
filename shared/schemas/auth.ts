import { z } from "zod";
import { APP_ROLES } from "../constants/roles";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
  groupId: z.string().min(1),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  email: z.email(),
  phone: z.string().min(6).max(32).optional(),
  password: z.string().min(8).max(128),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  globalRole: z.enum(APP_ROLES),
  activeGroupId: z.string().nullable(),
  memberships: z.array(
    z.object({
      groupId: z.string(),
      groupName: z.string(),
      role: z.enum(APP_ROLES),
    }),
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
