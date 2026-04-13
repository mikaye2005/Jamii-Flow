import type {
  CreateContributionCycleInput,
  CreateContributionPlanInput,
} from "../../shared/schemas/contributions";
import {
  createContributionCycle,
  createContributionPlan,
  listContributionCyclesByPlan,
  listContributionPlansByGroup,
  listDueItemsByCycle,
} from "../repositories/contributionsRepository";

export function getContributionPlansByGroup(db: D1Database, groupId: string) {
  return listContributionPlansByGroup(db, groupId);
}

export function createContributionPlanRecord(
  db: D1Database,
  input: CreateContributionPlanInput,
  actorUserId: string,
) {
  return createContributionPlan(db, input, actorUserId);
}

export function createContributionCycleRecord(db: D1Database, input: CreateContributionCycleInput) {
  return createContributionCycle(db, input);
}

export function getContributionCyclesByPlan(db: D1Database, contributionPlanId: string) {
  return listContributionCyclesByPlan(db, contributionPlanId);
}

export function getDueItemsByCycle(db: D1Database, contributionCycleId: string) {
  return listDueItemsByCycle(db, contributionCycleId);
}
