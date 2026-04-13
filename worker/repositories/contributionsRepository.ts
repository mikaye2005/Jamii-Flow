import type {
  CreateContributionCycleInput,
  CreateContributionPlanInput,
} from "../../shared/schemas/contributions";

export type ContributionPlanRecord = {
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

export type ContributionCycleRecord = {
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

export type MemberDueItemRecord = {
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

export async function listContributionPlansByGroup(
  db: D1Database,
  groupId: string,
): Promise<ContributionPlanRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, group_id, name, amount_minor, currency, frequency, status, start_date, end_date, created_at
       FROM contribution_plans
       WHERE group_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(groupId)
    .all<ContributionPlanRecord>();
  return result.results ?? [];
}

export async function createContributionPlan(
  db: D1Database,
  input: CreateContributionPlanInput,
  createdByUserId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO contribution_plans (
         id, group_id, name, description, amount_minor, currency, frequency, due_day,
         grace_days, start_date, end_date, status, created_by_user_id
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 'ACTIVE', ?12)`,
    )
    .bind(
      crypto.randomUUID(),
      input.groupId,
      input.name,
      input.description ?? null,
      input.amountMinor,
      input.currency.toUpperCase(),
      input.frequency,
      input.dueDay ?? null,
      input.graceDays,
      input.startDate,
      input.endDate ?? null,
      createdByUserId,
    )
    .run();
}

export async function createContributionCycle(
  db: D1Database,
  input: CreateContributionCycleInput,
): Promise<string> {
  const plan = await db
    .prepare(
      `SELECT id, group_id, amount_minor
       FROM contribution_plans
       WHERE id = ?1
       LIMIT 1`,
    )
    .bind(input.contributionPlanId)
    .first<{ id: string; group_id: string; amount_minor: number }>();

  if (!plan) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const cycleId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO contribution_cycles (
         id, contribution_plan_id, cycle_label, period_start, period_end, due_date, expected_amount_minor, status
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'OPEN')`,
    )
    .bind(
      cycleId,
      input.contributionPlanId,
      input.cycleLabel,
      input.periodStart,
      input.periodEnd,
      input.dueDate,
      plan.amount_minor,
    )
    .run();

  const memberships = await db
    .prepare(
      `SELECT id
       FROM group_memberships
       WHERE group_id = ?1 AND membership_status = 'ACTIVE'`,
    )
    .bind(plan.group_id)
    .all<{ id: string }>();

  for (const membership of memberships.results ?? []) {
    await db
      .prepare(
        `INSERT INTO member_due_items (
           id, group_id, group_membership_id, contribution_cycle_id, expected_amount_minor,
           paid_amount_minor, balance_amount_minor, due_date, status
         ) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?5, ?6, 'PENDING')`,
      )
      .bind(crypto.randomUUID(), plan.group_id, membership.id, cycleId, plan.amount_minor, input.dueDate)
      .run();
  }

  return cycleId;
}

export async function listContributionCyclesByPlan(
  db: D1Database,
  contributionPlanId: string,
): Promise<ContributionCycleRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, contribution_plan_id, cycle_label, period_start, period_end, due_date, expected_amount_minor, status, created_at
       FROM contribution_cycles
       WHERE contribution_plan_id = ?1
       ORDER BY created_at DESC`,
    )
    .bind(contributionPlanId)
    .all<ContributionCycleRecord>();
  return result.results ?? [];
}

export async function listDueItemsByCycle(
  db: D1Database,
  contributionCycleId: string,
): Promise<MemberDueItemRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, group_id, group_membership_id, contribution_cycle_id, expected_amount_minor, paid_amount_minor, balance_amount_minor, due_date, status
       FROM member_due_items
       WHERE contribution_cycle_id = ?1
       ORDER BY due_date ASC`,
    )
    .bind(contributionCycleId)
    .all<MemberDueItemRecord>();
  return result.results ?? [];
}
