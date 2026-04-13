import { apiGet } from "../../lib/apiClient";

export type Receipt = {
  id: string;
  payment_id: string;
  group_id: string;
  receipt_number: string;
  receipt_url: string | null;
  issued_at: string;
  delivery_status: string;
};

export function listReceipts(groupId: string) {
  return apiGet<{ receipts: Receipt[] }>(`/api/receipts?groupId=${encodeURIComponent(groupId)}`);
}
