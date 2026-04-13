import type { Context } from "hono";
import {
  createContributionCycleSchema,
  createContributionPlanSchema,
} from "../../shared/schemas/contributions";
import {
  createContributionCycleRecord,
  createContributionPlanRecord,
  getContributionCyclesByPlan,
  getContributionPlansByGroup,
  getDueItemsByCycle,
} from "../services/contributionsService";
import { fail, ok } from "../utils/http";

export async function listContributionPlansController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }
  const plans = await getContributionPlansByGroup(c.env.DB, groupId);
  return ok(c, { plans });
}

export async function createContributionPlanController(
  c: Context<{ Bindings: Env; Variables: { authUserId: string } }>,
) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createContributionPlanSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid contribution plan payload.", 400, "INVALID_CONTRIBUTION_PLAN_PAYLOAD");
  }

  await createContributionPlanRecord(c.env.DB, parsed.data, c.get("authUserId"));
  return ok(c, { created: true }, 201);
}

export async function createContributionCycleController(c: Context<{ Bindings: Env }>) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createContributionCycleSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid contribution cycle payload.", 400, "INVALID_CONTRIBUTION_CYCLE_PAYLOAD");
  }

  try {
    const cycleId = await createContributionCycleRecord(c.env.DB, parsed.data);
    return ok(c, { created: true, cycleId }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return fail(c, "Contribution plan not found.", 404, "CONTRIBUTION_PLAN_NOT_FOUND");
    }
    throw error;
  }
}

export async function listContributionCyclesController(c: Context<{ Bindings: Env }>) {
  const contributionPlanId = c.req.query("contributionPlanId");
  if (!contributionPlanId) {
    return fail(
      c,
      "contributionPlanId query parameter is required.",
      400,
      "CONTRIBUTION_PLAN_ID_REQUIRED",
    );
  }
  const cycles = await getContributionCyclesByPlan(c.env.DB, contributionPlanId);
  return ok(c, { cycles });
}

export async function listDueItemsController(c: Context<{ Bindings: Env }>) {
  const contributionCycleId = c.req.query("contributionCycleId");
  if (!contributionCycleId) {
    return fail(
      c,
      "contributionCycleId query parameter is required.",
      400,
      "CONTRIBUTION_CYCLE_ID_REQUIRED",
    );
  }
  const dueItems = await getDueItemsByCycle(c.env.DB, contributionCycleId);
  return ok(c, { dueItems });
}
