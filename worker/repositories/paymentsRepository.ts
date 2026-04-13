import type { CreatePaymentInput } from "../../shared/schemas/payments";

export type PaymentRecord = {
  id: string;
  group_id: string;
  payer_user_id: string;
  payment_method: string;
  reference_code: string | null;
  amount_minor: number;
  currency: string;
  payment_date: string;
  status: string;
  created_at: string;
};

export type ReceiptRecord = {
  id: string;
  payment_id: string;
  group_id: string;
  receipt_number: string;
  receipt_url: string | null;
  issued_at: string;
  delivery_status: string;
};

export type PaymentCallbackLookup = {
  id: string;
  group_id: string;
  payer_user_id: string;
  reference_code: string | null;
};

export type CreateWebhookLogInput = {
  provider: string;
  eventType: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  callbackResultCode?: number;
  callbackResultDesc?: string;
  ipAddress?: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  processingStatus: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";
  rawPayloadJson: string;
  errorMessage?: string;
};

export type PaymentWebhookLogRecord = {
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

export async function createPaymentWithReceipt(
  db: D1Database,
  input: CreatePaymentInput,
  receivedByUserId: string,
): Promise<{ paymentId: string; receiptId: string; receiptNumber: string }> {
  const paymentId = crypto.randomUUID();
  const receiptId = crypto.randomUUID();
  const receiptNumber = `RCPT-${Date.now()}`;

  await db
    .prepare(
      `INSERT INTO payments (
        id, group_id, payer_user_id, received_by_user_id, payment_method, reference_code,
        amount_minor, currency, payment_date, notes, status
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'POSTED')`,
    )
    .bind(
      paymentId,
      input.groupId,
      input.payerUserId,
      receivedByUserId,
      input.paymentMethod,
      input.referenceCode ?? null,
      input.amountMinor,
      input.currency.toUpperCase(),
      input.paymentDate,
      input.notes ?? null,
    )
    .run();

  for (const allocation of input.allocations) {
    await db
      .prepare(
        `INSERT INTO payment_allocations (id, payment_id, member_due_item_id, allocated_amount_minor)
         VALUES (?1, ?2, ?3, ?4)`,
      )
      .bind(crypto.randomUUID(), paymentId, allocation.memberDueItemId, allocation.allocatedAmountMinor)
      .run();

    await db
      .prepare(
        `UPDATE member_due_items
         SET paid_amount_minor = paid_amount_minor + ?1,
             balance_amount_minor = CASE
               WHEN balance_amount_minor - ?1 < 0 THEN 0
               ELSE balance_amount_minor - ?1
             END,
             status = CASE
               WHEN balance_amount_minor - ?1 <= 0 THEN 'PAID'
               WHEN paid_amount_minor + ?1 > 0 THEN 'PARTIALLY_PAID'
               ELSE status
             END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?2`,
      )
      .bind(allocation.allocatedAmountMinor, allocation.memberDueItemId)
      .run();
  }

  await db
    .prepare(
      `INSERT INTO receipts (
        id, payment_id, group_id, receipt_number, receipt_url, issued_by_user_id, delivery_status
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'PENDING')`,
    )
    .bind(receiptId, paymentId, input.groupId, receiptNumber, null, receivedByUserId)
    .run();

  return { paymentId, receiptId, receiptNumber };
}

export async function listPaymentsByGroup(db: D1Database, groupId: string): Promise<PaymentRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, group_id, payer_user_id, payment_method, reference_code, amount_minor, currency, payment_date, status, created_at
       FROM payments
       WHERE group_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(groupId)
    .all<PaymentRecord>();
  return result.results ?? [];
}

export async function listReceiptsByGroup(db: D1Database, groupId: string): Promise<ReceiptRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, payment_id, group_id, receipt_number, receipt_url, issued_at, delivery_status
       FROM receipts
       WHERE group_id = ?1
       ORDER BY issued_at DESC`,
    )
    .bind(groupId)
    .all<ReceiptRecord>();
  return result.results ?? [];
}

export async function findPaymentByReferenceCode(
  db: D1Database,
  referenceCode: string,
): Promise<PaymentCallbackLookup | null> {
  const result = await db
    .prepare(
      `SELECT id, group_id, payer_user_id, reference_code
       FROM payments
       WHERE reference_code = ?1
       LIMIT 1`,
    )
    .bind(referenceCode)
    .first<PaymentCallbackLookup>();
  return result ?? null;
}

export async function markReceiptDeliveredByPaymentId(db: D1Database, paymentId: string): Promise<void> {
  await db
    .prepare(
      `UPDATE receipts
       SET delivery_status = 'SENT', updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = ?1`,
    )
    .bind(paymentId)
    .run();
}

export async function createPaymentWebhookLog(
  db: D1Database,
  input: CreateWebhookLogInput,
): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO payment_webhook_logs (
        id, provider, event_type, checkout_request_id, merchant_request_id, callback_result_code,
        callback_result_desc, ip_address, verification_status, processing_status, raw_payload_json, error_message
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
    )
    .bind(
      id,
      input.provider,
      input.eventType,
      input.checkoutRequestId ?? null,
      input.merchantRequestId ?? null,
      input.callbackResultCode ?? null,
      input.callbackResultDesc ?? null,
      input.ipAddress ?? null,
      input.verificationStatus,
      input.processingStatus,
      input.rawPayloadJson,
      input.errorMessage ?? null,
    )
    .run();

  return id;
}

export async function updatePaymentWebhookLogStatus(
  db: D1Database,
  logId: string,
  input: {
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
    processingStatus?: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";
    errorMessage?: string;
  },
): Promise<void> {
  await db
    .prepare(
      `UPDATE payment_webhook_logs
       SET verification_status = COALESCE(?1, verification_status),
           processing_status = COALESCE(?2, processing_status),
           error_message = COALESCE(?3, error_message),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?4`,
    )
    .bind(
      input.verificationStatus ?? null,
      input.processingStatus ?? null,
      input.errorMessage ?? null,
      logId,
    )
    .run();
}

export async function listPaymentWebhookLogs(
  db: D1Database,
  limit = 50,
): Promise<PaymentWebhookLogRecord[]> {
  const safeLimit = Math.max(1, Math.min(limit, 200));
  const result = await db
    .prepare(
      `SELECT
         id, provider, event_type, checkout_request_id, merchant_request_id,
         callback_result_code, callback_result_desc, ip_address, verification_status,
         processing_status, error_message, created_at
       FROM payment_webhook_logs
       ORDER BY created_at DESC
       LIMIT ?1`,
    )
    .bind(safeLimit)
    .all<PaymentWebhookLogRecord>();
  return result.results ?? [];
}
