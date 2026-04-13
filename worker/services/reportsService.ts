import {
  getCollectionTrend,
  getDashboardSummary,
  getGroupPerformance,
} from "../repositories/reportsRepository";

export function fetchDashboardSummary(db: D1Database, groupId?: string) {
  return getDashboardSummary(db, groupId);
}

export function fetchCollectionTrend(db: D1Database, months: number, groupId?: string) {
  return getCollectionTrend(db, months, groupId);
}

export function fetchGroupPerformance(db: D1Database, months: number) {
  return getGroupPerformance(db, months);
}
