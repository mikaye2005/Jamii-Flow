import type {
  CreateAuditLogInput,
  CreateNotificationInput,
  CreateReminderInput,
} from "../../shared/schemas/reminders";
import {
  createAuditLog,
  createNotification,
  createReminder,
  listArrearsByGroup,
  listAuditLogsByGroup,
  listNotificationsByUser,
  listRemindersByGroup,
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
