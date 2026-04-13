import type { CreateGroupInput, UpdateGroupInput } from "../../shared/schemas/groups";
import {
  createGroup,
  findGroupById,
  listGroups,
  updateGroup,
} from "../repositories/groupsRepository";

export function getGroups(db: D1Database) {
  return listGroups(db);
}

export function getGroupById(db: D1Database, groupId: string) {
  return findGroupById(db, groupId);
}

export function createGroupRecord(db: D1Database, input: CreateGroupInput, actorUserId: string) {
  return createGroup(db, input, actorUserId);
}

export function updateGroupRecord(db: D1Database, groupId: string, input: UpdateGroupInput) {
  return updateGroup(db, groupId, input);
}
