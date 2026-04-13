import { apiGet, apiPost } from "../../lib/apiClient";

export type Payment = {
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

export type CreatePaymentPayload = {
  groupId: string;
  payerUserId: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "OTHER";
  referenceCode?: string;
  amountMinor: number;
  currency: string;
  paymentDate: string;
  notes?: string;
  allocations: Array<{
    memberDueItemId: string;
    allocatedAmountMinor: number;
  }>;
};

export function listPayments(groupId: string) {
  return apiGet<{ payments: Payment[] }>(`/api/payments?groupId=${encodeURIComponent(groupId)}`);
}

export function createPayment(payload: CreatePaymentPayload) {
  return apiPost<
    { created: boolean; paymentId: string; receiptId: string; receiptNumber: string },
    CreatePaymentPayload
  >("/api/payments", payload);
}

export function initiateMpesaStkPush(payload: {
  amountMinor: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}) {
  return apiPost<
    {
      initiated: boolean;
      provider: string;
      merchantRequestId: string;
      checkoutRequestId: string;
      requestedAt: string;
    },
    typeof payload
  >("/api/payments/mpesa/stk-push", payload);
}
