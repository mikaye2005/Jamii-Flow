import { apiGet, apiPost } from "../../lib/apiClient";

export type Arrear = {
  member_due_item_id: string;
  group_id: string;
  group_membership_id: string;
  due_date: string;
  expected_amount_minor: number;
  paid_amount_minor: number;
  balance_amount_minor: number;
  status: string;
  member_name: string;
  member_email: string;
};

export type Reminder = {
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

export type Notification = {
  id: string;
  user_id: string;
  group_id: string | null;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  group_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
};

export type PaymentWebhookLog = {
  id: string;
  provider: string;
  event_type: string;
  checkout_request_id: string | null;
  merchant_request_id: string | null;
  callback_result_code: number | null;
  callback_result_desc: string | null;
  ip_address: string | null;
  verification_status: string;
  processing_status: string;
  error_message: string | null;
  created_at: string;
};

export function listArrears(groupId: string) {
  return apiGet<{ arrears: Arrear[] }>(`/api/operations/arrears?groupId=${encodeURIComponent(groupId)}`);
}

export function listReminders(groupId: string) {
  return apiGet<{ reminders: Reminder[] }>(
    `/api/operations/reminders?groupId=${encodeURIComponent(groupId)}`,
  );
}

export function createReminder(payload: {
  groupId: string;
  memberDueItemId: string;
  reminderType: "UPCOMING" | "DUE_TODAY" | "OVERDUE";
  scheduledFor: string;
  channel: "SMS" | "EMAIL" | "WHATSAPP" | "IN_APP";
}) {
  return apiPost<{ created: boolean }, typeof payload>("/api/operations/reminders", payload);
}

export function listNotifications(userId: string) {
  return apiGet<{ notifications: Notification[] }>(
    `/api/operations/notifications?userId=${encodeURIComponent(userId)}`,
  );
}

export function listAuditLogs(groupId: string) {
  return apiGet<{ auditLogs: AuditLog[] }>(
    `/api/operations/audit-logs?groupId=${encodeURIComponent(groupId)}`,
  );
}

export function listPaymentWebhookLogs(limit = 50) {
  return apiGet<{ webhooks: PaymentWebhookLog[] }>(
    `/api/operations/payment-webhooks?limit=${encodeURIComponent(String(limit))}`,
  );
}
