import type { Context } from "hono";
import { createPaymentSchema, mpesaStkPushSchema } from "../../shared/schemas/payments";
import type { CreateAuditLogInput, CreateNotificationInput } from "../../shared/schemas/reminders";
import { createAuditLogRecord, createNotificationRecord } from "../services/operationsService";
import {
  createPaymentWebhookLog,
  findPaymentByReferenceCode,
  markReceiptDeliveredByPaymentId,
  updatePaymentWebhookLogStatus,
} from "../repositories/paymentsRepository";
import { initiateMpesaStkPush, parseMpesaCallback } from "../services/mpesaService";
import { createPaymentRecord, getPaymentsByGroup, getReceiptsByGroup } from "../services/paymentsService";
import { fail, ok } from "../utils/http";

export async function listPaymentsController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }
  const payments = await getPaymentsByGroup(c.env.DB, groupId);
  return ok(c, { payments });
}

export async function createPaymentController(
  c: Context<{ Bindings: Env; Variables: { authUserId: string } }>,
) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createPaymentSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid payment payload.", 400, "INVALID_PAYMENT_PAYLOAD");
  }
  const result = await createPaymentRecord(c.env.DB, parsed.data, c.get("authUserId"));
  return ok(c, { created: true, ...result }, 201);
}

export async function listReceiptsController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }
  const receipts = await getReceiptsByGroup(c.env.DB, groupId);
  return ok(c, { receipts });
}

export async function initiateMpesaStkPushController(c: Context<{ Bindings: Env }>) {
  const payload = await c.req.json().catch(() => null);
  const parsed = mpesaStkPushSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid M-Pesa STK payload.", 400, "INVALID_MPESA_STK_PAYLOAD");
  }

  try {
    const result = await initiateMpesaStkPush(c.env, parsed.data);
    return ok(c, { initiated: true, ...result }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "MPESA_CONFIG_MISSING") {
      return fail(
        c,
        "M-Pesa is not configured. Set MPESA secrets and vars first.",
        503,
        "MPESA_CONFIG_MISSING",
      );
    }
    return fail(c, "Failed to initiate M-Pesa STK push.", 502, "MPESA_STK_PUSH_FAILED");
  }
}

export async function mpesaCallbackController(c: Context<{ Bindings: Env }>) {
  const payload = await c.req.json().catch(() => null);
  if (!payload) {
    return fail(c, "Invalid callback payload.", 400, "INVALID_CALLBACK_PAYLOAD");
  }

  const source = c.env as unknown as Record<string, unknown>;
  const expectedToken =
    typeof source.MPESA_CALLBACK_TOKEN === "string" && source.MPESA_CALLBACK_TOKEN.length > 0
      ? source.MPESA_CALLBACK_TOKEN
      : undefined;
  const ipAllowlistRaw =
    typeof source.MPESA_CALLBACK_IP_ALLOWLIST === "string" ? source.MPESA_CALLBACK_IP_ALLOWLIST : "";
  const ipAllowlist = ipAllowlistRaw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const requestIp = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "";

  const callbackToken = c.req.header("x-callback-token") ?? c.req.header("authorization") ?? "";
  const tokenValid = !expectedToken || callbackToken === expectedToken;
  const ipValid = ipAllowlist.length === 0 || ipAllowlist.includes(requestIp);

  let parsedCallback: ReturnType<typeof parseMpesaCallback>;
  try {
    parsedCallback = parseMpesaCallback(payload);
  } catch {
    return fail(c, "Unrecognized callback format.", 400, "INVALID_CALLBACK_FORMAT");
  }

  const webhookLogId = await createPaymentWebhookLog(c.env.DB, {
    provider: "MPESA",
    eventType: "STK_CALLBACK",
    checkoutRequestId: parsedCallback.checkoutRequestId,
    merchantRequestId: parsedCallback.merchantRequestId,
    callbackResultCode: parsedCallback.resultCode,
    callbackResultDesc: parsedCallback.resultDesc,
    ipAddress: requestIp,
    verificationStatus: tokenValid && ipValid ? "VERIFIED" : "REJECTED",
    processingStatus: "RECEIVED",
    rawPayloadJson: JSON.stringify(payload),
    errorMessage: tokenValid && ipValid ? undefined : "Callback verification failed",
  });

  if (!tokenValid || !ipValid) {
    await updatePaymentWebhookLogStatus(c.env.DB, webhookLogId, {
      processingStatus: "FAILED",
      errorMessage: !tokenValid ? "Invalid callback token" : "Untrusted callback IP",
    });
    return fail(c, "Callback verification failed.", 403, "CALLBACK_VERIFICATION_FAILED");
  }

  const payment = await findPaymentByReferenceCode(c.env.DB, parsedCallback.checkoutRequestId);
  if (!payment) {
    await updatePaymentWebhookLogStatus(c.env.DB, webhookLogId, {
      processingStatus: "IGNORED",
      errorMessage: "No payment matched callback reference",
    });
    return ok(c, { accepted: true, matched: false });
  }

  if (parsedCallback.resultCode === 0) {
    await markReceiptDeliveredByPaymentId(c.env.DB, payment.id);

    const notificationPayload: CreateNotificationInput = {
      userId: payment.payer_user_id,
      groupId: payment.group_id,
      type: "PAYMENT_CONFIRMED",
      title: "Payment Confirmed",
      message: `M-Pesa payment confirmed (${parsedCallback.mpesaReceiptNumber ?? "no receipt number"}).`,
      payloadJson: JSON.stringify({
        checkoutRequestId: parsedCallback.checkoutRequestId,
        mpesaReceiptNumber: parsedCallback.mpesaReceiptNumber,
      }),
    };
    await createNotificationRecord(c.env.DB, notificationPayload);
  }

  const auditPayload: CreateAuditLogInput = {
    groupId: payment.group_id,
    action: "MPESA_CALLBACK_RECEIVED",
    entityType: "PAYMENT",
    entityId: payment.id,
    afterJson: JSON.stringify({
      checkoutRequestId: parsedCallback.checkoutRequestId,
      resultCode: parsedCallback.resultCode,
      resultDesc: parsedCallback.resultDesc,
      mpesaReceiptNumber: parsedCallback.mpesaReceiptNumber,
    }),
  };
  await createAuditLogRecord(c.env.DB, auditPayload, null);

  await updatePaymentWebhookLogStatus(c.env.DB, webhookLogId, {
    processingStatus: "PROCESSED",
  });

  return ok(c, { accepted: true, matched: true });
}
