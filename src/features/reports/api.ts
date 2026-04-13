import { apiGet } from "../../lib/apiClient";

export type DashboardSummary = {
  total_groups: number;
  total_members: number;
  total_payments_minor: number;
  arrears_items: number;
};

export type CollectionTrendRow = {
  period_label: string;
  amount_minor: number;
};

export type GroupPerformanceRow = {
  group_id: string;
  group_name: string;
  members_count: number;
  collected_minor: number;
  arrears_minor: number;
};

export function getDashboardSummary(groupId?: string) {
  const query = groupId ? `?groupId=${encodeURIComponent(groupId)}` : "";
  return apiGet<{ summary: DashboardSummary }>(`/api/reports/summary${query}`);
}

export function getCollectionTrend(months: number, groupId?: string) {
  const params = new URLSearchParams({ months: String(months) });
  if (groupId) {
    params.set("groupId", groupId);
  }
  return apiGet<{ trend: CollectionTrendRow[] }>(`/api/reports/collection-trend?${params.toString()}`);
}

export function getGroupPerformance(months: number) {
  return apiGet<{ performance: GroupPerformanceRow[] }>(
    `/api/reports/group-performance?months=${encodeURIComponent(String(months))}`,
  );
}
