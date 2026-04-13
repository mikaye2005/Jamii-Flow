import type { Context } from "hono";
import {
  createAuditLogSchema,
  createNotificationSchema,
  createReminderSchema,
} from "../../shared/schemas/reminders";
import {
  createAuditLogRecord,
  createNotificationRecord,
  createReminderRecord,
  getArrearsByGroup,
  getAuditLogsByGroup,
  getPaymentWebhookLogs,
  getNotificationsByUser,
  getRemindersByGroup,
} from "../services/operationsService";
import { fail, ok } from "../utils/http";

export async function listArrearsController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }
  const arrears = await getArrearsByGroup(c.env.DB, groupId);
  return ok(c, { arrears });
}

export async function listRemindersController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }
  const reminders = await getRemindersByGroup(c.env.DB, groupId);
  return ok(c, { reminders });
}

export async function createReminderController(c: Context<{ Bindings: Env }>) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createReminderSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid reminder payload.", 400, "INVALID_REMINDER_PAYLOAD");
  }
  await createReminderRecord(c.env.DB, parsed.data);
  return ok(c, { created: true }, 201);
}

export async function listNotificationsController(c: Context<{ Bindings: Env }>) {
  const userId = c.req.query("userId");
  if (!userId) {
    return fail(c, "userId query parameter is required.", 400, "USER_ID_REQUIRED");
  }
  const notifications = await getNotificationsByUser(c.env.DB, userId);
  return ok(c, { notifications });
}

export async function createNotificationController(c: Context<{ Bindings: Env }>) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createNotificationSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid notification payload.", 400, "INVALID_NOTIFICATION_PAYLOAD");
  }
  await createNotificationRecord(c.env.DB, parsed.data);
  return ok(c, { created: true }, 201);
}

export async function listAuditLogsController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }
  const auditLogs = await getAuditLogsByGroup(c.env.DB, groupId);
  return ok(c, { auditLogs });
}

export async function createAuditLogController(
  c: Context<{ Bindings: Env; Variables: { authUserId: string } }>,
) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createAuditLogSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid audit log payload.", 400, "INVALID_AUDIT_LOG_PAYLOAD");
  }
  await createAuditLogRecord(c.env.DB, parsed.data, c.get("authUserId"));
  return ok(c, { created: true }, 201);
}

export async function listPaymentWebhookLogsController(c: Context<{ Bindings: Env }>) {
  const limitRaw = c.req.query("limit");
  const parsedLimit = Number(limitRaw);
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 50;
  const webhooks = await getPaymentWebhookLogs(c.env.DB, limit);
  return ok(c, { webhooks });
}
