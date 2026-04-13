import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  description: z.string().max(500).optional(),
  defaultCurrency: z.string().length(3).default("KES"),
});

export const updateGroupSchema = createGroupSchema.partial();

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
