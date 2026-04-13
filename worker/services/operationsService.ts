import type {
  CreateAuditLogInput,
  CreateGroupBroadcastInput,
  CreateNotificationInput,
  CreateReminderInput,
} from "../../shared/schemas/reminders";
import {
  createAuditLog,
  createNotification,
  createReminder,
  createGroupBroadcastNotifications,
  listArrearsByGroup,
  listAuditLogsByGroup,
  listNotificationsByUser,
  listRemindersByGroup,
  markNotificationRead,
  markOverdueDueItems,
} from "../repositories/operationsRepository";
import { listPaymentWebhookLogs } from "../repositories/paymentsRepository";

export async function getArrearsByGroup(db: D1Database, groupId: string) {
  await markOverdueDueItems(db, groupId);
  return listArrearsByGroup(db, groupId);
}

export function createReminderRecord(db: D1Database, input: CreateReminderInput) {
  return createReminder(db, input);
}

export function getRemindersByGroup(db: D1Database, groupId: string) {
  return listRemindersByGroup(db, groupId);
}

export function createNotificationRecord(db: D1Database, input: CreateNotificationInput) {
  return createNotification(db, input);
}

export function getNotificationsByUser(db: D1Database, userId: string) {
  return listNotificationsByUser(db, userId);
}

export function markNotificationAsRead(db: D1Database, notificationId: string, userId: string) {
  return markNotificationRead(db, notificationId, userId);
}

export function createGroupBroadcastNotificationRecord(
  db: D1Database,
  input: CreateGroupBroadcastInput,
) {
  return createGroupBroadcastNotifications(db, input);
}

export function createAuditLogRecord(
  db: D1Database,
  input: CreateAuditLogInput,
  actorUserId: string | null,
) {
  return createAuditLog(db, input, actorUserId);
}

export function getAuditLogsByGroup(db: D1Database, groupId: string) {
  return listAuditLogsByGroup(db, groupId);
}

export function getPaymentWebhookLogs(db: D1Database, limit?: number) {
  return listPaymentWebhookLogs(db, limit);
}
