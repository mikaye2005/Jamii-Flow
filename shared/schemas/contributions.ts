import { z } from "zod";

export const createContributionPlanSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  amountMinor: z.number().int().positive(),
  currency: z.literal("KES").default("KES"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "ONE_TIME"]),
  dueDay: z.number().int().min(1).max(31).optional(),
  graceDays: z.number().int().min(0).max(30).default(0),
  startDate: z.string().min(8),
  endDate: z.string().optional(),
});

export const createContributionCycleSchema = z.object({
  contributionPlanId: z.string().min(1),
  cycleLabel: z.string().min(2).max(60),
  periodStart: z.string().min(8),
  periodEnd: z.string().min(8),
  dueDate: z.string().min(8),
});

export type CreateContributionPlanInput = z.infer<typeof createContributionPlanSchema>;
export type CreateContributionCycleInput = z.infer<typeof createContributionCycleSchema>;
