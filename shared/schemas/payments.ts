import { z } from "zod";

export const paymentAllocationInputSchema = z.object({
  memberDueItemId: z.string().min(1),
  allocatedAmountMinor: z.number().int().positive(),
});

export const createPaymentSchema = z.object({
  groupId: z.string().min(1),
  payerUserId: z.string().min(1),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "OTHER"]),
  referenceCode: z.string().max(100).optional(),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3).default("KES"),
  paymentDate: z.string().min(8),
  notes: z.string().max(500).optional(),
  allocations: z.array(paymentAllocationInputSchema).default([]),
});

export const mpesaStkPushSchema = z.object({
  amountMinor: z.number().int().positive(),
  phoneNumber: z.string().min(10).max(20),
  accountReference: z.string().min(2).max(40),
  transactionDesc: z.string().min(2).max(80),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type MpesaStkPushInput = z.infer<typeof mpesaStkPushSchema>;
