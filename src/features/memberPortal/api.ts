import { apiGet } from "../../lib/apiClient";

export type MemberPortalOverview = {
  groupId: string;
  summary: {
    totalPaidMinor: number;
    pendingMinor: number;
    pendingItems: number;
    currency: "KES";
  };
  dueItems: Array<{
    id: string;
    expected_amount_minor: number;
    paid_amount_minor: number;
    balance_amount_minor: number;
    due_date: string;
    status: string;
    cycle_label: string | null;
  }>;
  payments: Array<{
    id: string;
    payment_method: string;
    amount_minor: number;
    currency: "KES";
    payment_date: string;
    reference_code: string | null;
    status: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    status: "UNREAD" | "READ" | "ARCHIVED";
    created_at: string;
  }>;
  trend: Array<{
    period: string;
    amount_minor: number;
  }>;
};

export function getMemberPortalOverview(groupId?: string) {
  const suffix = groupId ? `?groupId=${encodeURIComponent(groupId)}` : "";
  return apiGet<MemberPortalOverview>(`/api/member-portal/overview${suffix}`);
}
