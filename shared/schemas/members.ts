import { z } from "zod";

export const createMemberSchema = z.object({
  groupId: z.string().min(1),
  email: z.email(),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().min(6).max(32).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().min(4).max(240).optional(),
  accountRole: z.enum(["MEMBER", "GROUP_ADMIN"]).optional(),
  temporaryPassword: z.string().min(8).max(128).optional(),
});

export const updateMemberSchema = z.object({
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(80).optional(),
  phone: z.string().min(6).max(32).optional(),
  membershipStatus: z.enum(["ACTIVE", "INACTIVE", "EXITED"]).optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
