import type { CreateMemberInput, UpdateMemberInput } from "../../shared/schemas/members";
import {
  createMemberWithMembership,
  listMembersByGroup,
  updateMember,
} from "../repositories/membersRepository";

export function getMembersByGroup(db: D1Database, groupId: string) {
  return listMembersByGroup(db, groupId);
}

export function createMemberRecord(db: D1Database, input: CreateMemberInput) {
  return createMemberWithMembership(db, input);
}

export function updateMemberRecord(db: D1Database, membershipId: string, input: UpdateMemberInput) {
  return updateMember(db, membershipId, input);
}
