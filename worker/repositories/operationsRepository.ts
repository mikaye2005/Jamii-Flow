import type {
  CreateAuditLogInput,
  CreateNotificationInput,
  CreateReminderInput,
} from "../../shared/schemas/reminders";

export type ArrearRecord = {
  member_due_item_id: string;
  group_id: string;
  group_membership_id: string;
  due_date: string;
  expected_amount_minor: number;
  paid_amount_minor: number;
  balance_amount_minor: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "WAIVED";
  member_name: string;
  member_email: string;
};

export type ReminderRecord = {
  id: string;
  group_id: string;
  member_due_item_id: string;
  reminder_type: string;
  scheduled_for: string;
  sent_at: string | null;
  channel: string;
  status: string;
  created_at: string;
};

export type NotificationRecord = {
  id: string;
  user_id: string;
  group_id: string | null;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
};

export type AuditLogRecord = {
  id: string;
  actor_user_id: string | null;
  group_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
};

export async function listArrearsByGroup(db: D1Database, groupId: string): Promise<ArrearRecord[]> {
  const result = await db
    .prepare(
      `SELECT
         mdi.id AS member_due_item_id,
         mdi.group_id,
         mdi.group_membership_id,
         mdi.due_date,
         mdi.expected_amount_minor,
         mdi.paid_amount_minor,
         mdi.balance_amount_minor,
         mdi.status,
         (u.first_name || ' ' || u.last_name) AS member_name,
         u.email AS member_email
       FROM member_due_items mdi
       INNER JOIN group_memberships gm ON gm.id = mdi.group_membership_id
       INNER JOIN users u ON u.id = gm.user_id
       WHERE mdi.group_id = ?1
         AND mdi.balance_amount_minor > 0
       ORDER BY mdi.due_date ASC`,
    )
    .bind(groupId)
    .all<ArrearRecord>();

  return result.results ?? [];
}

export async function markOverdueDueItems(db: D1Database, groupId: string): Promise<number> {
  const result = await db
    .prepare(
      `UPDATE member_due_items
       SET status = 'OVERDUE', updated_at = CURRENT_TIMESTAMP
       WHERE group_id = ?1
         AND balance_amount_minor > 0
         AND status IN ('PENDING', 'PARTIALLY_PAID')
         AND due_date < date('now')`,
    )
    .bind(groupId)
    .run();

  return Number(result.meta.changes ?? 0);
}

export async function createReminder(db: D1Database, input: CreateReminderInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO reminders (
         id, group_id, member_due_item_id, reminder_type, scheduled_for, channel, status
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'PENDING')`,
    )
    .bind(
      crypto.randomUUID(),
      input.groupId,
      input.memberDueItemId,
      input.reminderType,
      input.scheduledFor,
      input.channel,
    )
    .run();
}

export async function listRemindersByGroup(db: D1Database, groupId: string): Promise<ReminderRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, group_id, member_due_item_id, reminder_type, scheduled_for, sent_at, channel, status, created_at
       FROM reminders
       WHERE group_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(groupId)
    .all<ReminderRecord>();
  return result.results ?? [];
}

export async function createNotification(db: D1Database, input: CreateNotificationInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO notifications (
         id, user_id, group_id, type, title, message, payload_json, status
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'UNREAD')`,
    )
    .bind(
      crypto.randomUUID(),
      input.userId,
      input.groupId ?? null,
      input.type,
      input.title,
      input.message,
      input.payloadJson ?? null,
    )
    .run();
}

export async function listNotificationsByUser(
  db: D1Database,
  userId: string,
): Promise<NotificationRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, user_id, group_id, type, title, message, status, created_at
       FROM notifications
       WHERE user_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(userId)
    .all<NotificationRecord>();
  return result.results ?? [];
}

export async function createAuditLog(
  db: D1Database,
  input: CreateAuditLogInput,
  actorUserId: string | null,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_logs (
         id, actor_user_id, group_id, action, entity_type, entity_id, before_json, after_json
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    )
    .bind(
      crypto.randomUUID(),
      actorUserId,
      input.groupId ?? null,
      input.action,
      input.entityType,
      input.entityId,
      input.beforeJson ?? null,
      input.afterJson ?? null,
    )
    .run();
}

export async function listAuditLogsByGroup(db: D1Database, groupId: string): Promise<AuditLogRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, actor_user_id, group_id, action, entity_type, entity_id, created_at
       FROM audit_logs
       WHERE group_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(groupId)
    .all<AuditLogRecord>();
  return result.results ?? [];
}
