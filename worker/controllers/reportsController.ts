import type { Context } from "hono";
import {
  fetchCollectionTrend,
  fetchDashboardSummary,
  fetchGroupPerformance,
} from "../services/reportsService";
import { ok } from "../utils/http";

function parseMonths(value: string | undefined, fallback = 6) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function dashboardSummaryController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  const summary = await fetchDashboardSummary(c.env.DB, groupId || undefined);
  return ok(c, { summary });
}

export async function collectionTrendController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  const months = parseMonths(c.req.query("months"), 6);
  const trend = await fetchCollectionTrend(c.env.DB, months, groupId || undefined);
  return ok(c, { trend });
}

export async function groupPerformanceController(c: Context<{ Bindings: Env }>) {
  const months = parseMonths(c.req.query("months"), 3);
  const performance = await fetchGroupPerformance(c.env.DB, months);
  return ok(c, { performance });
}
