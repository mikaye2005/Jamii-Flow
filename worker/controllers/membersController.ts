import type { Context } from "hono";
import { createMemberSchema, updateMemberSchema } from "../../shared/schemas/members";
import { createMemberRecord, getMembersByGroup, updateMemberRecord } from "../services/membersService";
import { fail, ok } from "../utils/http";

export async function listMembersByGroupController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }

  const members = await getMembersByGroup(c.env.DB, groupId);
  return ok(c, { members });
}

export async function createMemberController(c: Context<{ Bindings: Env }>) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createMemberSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid member payload.", 400, "INVALID_MEMBER_PAYLOAD");
  }

  await createMemberRecord(c.env.DB, parsed.data);
  return ok(c, { created: true }, 201);
}

export async function updateMemberController(c: Context<{ Bindings: Env }>) {
  const membershipId = c.req.param("membershipId");
  if (!membershipId) {
    return fail(c, "Membership id is required.", 400, "MEMBERSHIP_ID_REQUIRED");
  }
  const payload = await c.req.json().catch(() => null);
  const parsed = updateMemberSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid member update payload.", 400, "INVALID_MEMBER_UPDATE_PAYLOAD");
  }

  await updateMemberRecord(c.env.DB, membershipId, parsed.data);
  return ok(c, { updated: true });
}
