import type { Context } from "hono";
import { createGroupSchema, updateGroupSchema } from "../../shared/schemas/groups";
import {
  createGroupRecord,
  getGroupById,
  getGroups,
  updateGroupRecord,
} from "../services/groupsService";
import { fail, ok } from "../utils/http";

export async function listGroupsController(c: Context<{ Bindings: Env }>) {
  const groups = await getGroups(c.env.DB);
  return ok(c, { groups });
}

export async function getGroupController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.param("groupId");
  if (!groupId) {
    return fail(c, "Group id is required.", 400, "GROUP_ID_REQUIRED");
  }
  const group = await getGroupById(c.env.DB, groupId);
  if (!group) {
    return fail(c, "Group not found.", 404, "GROUP_NOT_FOUND");
  }
  return ok(c, { group });
}

export async function createGroupController(c: Context<{ Bindings: Env; Variables: { authUserId: string } }>) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createGroupSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid group payload.", 400, "INVALID_GROUP_PAYLOAD");
  }

  await createGroupRecord(c.env.DB, parsed.data, c.get("authUserId"));
  return ok(c, { created: true }, 201);
}

export async function updateGroupController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.param("groupId");
  if (!groupId) {
    return fail(c, "Group id is required.", 400, "GROUP_ID_REQUIRED");
  }
  const payload = await c.req.json().catch(() => null);
  const parsed = updateGroupSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid group update payload.", 400, "INVALID_GROUP_UPDATE_PAYLOAD");
  }

  await updateGroupRecord(c.env.DB, groupId, parsed.data);
  return ok(c, { updated: true });
}
