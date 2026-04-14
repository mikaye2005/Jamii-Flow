import type { CreateMemberInput, UpdateMemberInput } from "../../shared/schemas/members";
import { sha256Hex } from "../../shared/utils/auth";
import {
  createMemberWithMembership,
  listMembersByGroup,
  updateMember,
} from "../repositories/membersRepository";

export function getMembersByGroup(db: D1Database, groupId: string) {
  return listMembersByGroup(db, groupId);
}

function generateTemporaryPassword(): string {
  return `JamiiFlow#${Math.random().toString(36).slice(2, 8)}${Math.floor(100 + Math.random() * 900)}`;
}

export async function createMemberRecord(db: D1Database, input: CreateMemberInput) {
  const temporaryPassword = input.temporaryPassword ?? generateTemporaryPassword();
  const passwordHash = await sha256Hex(temporaryPassword);
  return createMemberWithMembership(db, input, {
    passwordHash,
    temporaryPassword,
  });
}

export function updateMemberRecord(db: D1Database, membershipId: string, input: UpdateMemberInput) {
  return updateMember(db, membershipId, input);
}
