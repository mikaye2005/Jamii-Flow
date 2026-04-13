import { z } from "zod";

export const createReminderSchema = z.object({
  groupId: z.string().min(1),
  memberDueItemId: z.string().min(1),
  reminderType: z.enum(["UPCOMING", "DUE_TODAY", "OVERDUE"]),
  scheduledFor: z.string().min(8),
  channel: z.enum(["SMS", "EMAIL", "WHATSAPP", "IN_APP"]),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  groupId: z.string().optional(),
  type: z.string().min(2).max(60),
  title: z.string().min(2).max(120),
  message: z.string().min(2).max(500),
  payloadJson: z.string().optional(),
});

export const createAuditLogSchema = z.object({
  groupId: z.string().optional(),
  action: z.string().min(2).max(120),
  entityType: z.string().min(2).max(80),
  entityId: z.string().min(1).max(120),
  beforeJson: z.string().optional(),
  afterJson: z.string().optional(),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
