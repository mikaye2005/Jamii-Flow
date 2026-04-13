import type { CreatePaymentInput } from "../../shared/schemas/payments";
import {
  createPaymentWithReceipt,
  listPaymentsByGroup,
  listReceiptsByGroup,
} from "../repositories/paymentsRepository";

export function createPaymentRecord(db: D1Database, input: CreatePaymentInput, actorUserId: string) {
  return createPaymentWithReceipt(db, input, actorUserId);
}

export function getPaymentsByGroup(db: D1Database, groupId: string) {
  return listPaymentsByGroup(db, groupId);
}

export function getReceiptsByGroup(db: D1Database, groupId: string) {
  return listReceiptsByGroup(db, groupId);
}
