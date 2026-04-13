import { apiGet, apiPost } from "../../lib/apiClient";

export type ContributionPlan = {
  id: string;
  group_id: string;
  name: string;
  amount_minor: number;
  currency: string;
  frequency: "WEEKLY" | "MONTHLY" | "ONE_TIME";
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type ContributionCycle = {
  id: string;
  contribution_plan_id: string;
  cycle_label: string;
  period_start: string;
  period_end: string;
  due_date: string;
  expected_amount_minor: number;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  created_at: string;
};

export type MemberDueItem = {
  id: string;
  group_id: string;
  group_membership_id: string;
  contribution_cycle_id: string;
  expected_amount_minor: number;
  paid_amount_minor: number;
  balance_amount_minor: number;
  due_date: string;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "WAIVED";
};

export type CreateContributionPlanPayload = {
  groupId: string;
  name: string;
  description?: string;
  amountMinor: number;
  currency: string;
  frequency: "WEEKLY" | "MONTHLY" | "ONE_TIME";
  dueDay?: number;
  graceDays: number;
  startDate: string;
  endDate?: string;
};

export type CreateContributionCyclePayload = {
  contributionPlanId: string;
  cycleLabel: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
};

export function listContributionPlans(groupId: string) {
  return apiGet<{ plans: ContributionPlan[] }>(
    `/api/contributions/plans?groupId=${encodeURIComponent(groupId)}`,
  );
}

export function createContributionPlan(payload: CreateContributionPlanPayload) {
  return apiPost<{ created: boolean }, CreateContributionPlanPayload>(
    "/api/contributions/plans",
    payload,
  );
}

export function listContributionCycles(contributionPlanId: string) {
  return apiGet<{ cycles: ContributionCycle[] }>(
    `/api/contributions/cycles?contributionPlanId=${encodeURIComponent(contributionPlanId)}`,
  );
}

export function createContributionCycle(payload: CreateContributionCyclePayload) {
  return apiPost<{ created: boolean; cycleId: string }, CreateContributionCyclePayload>(
    "/api/contributions/cycles",
    payload,
  );
}

export function listDueItems(contributionCycleId: string) {
  return apiGet<{ dueItems: MemberDueItem[] }>(
    `/api/contributions/due-items?contributionCycleId=${encodeURIComponent(contributionCycleId)}`,
  );
}
