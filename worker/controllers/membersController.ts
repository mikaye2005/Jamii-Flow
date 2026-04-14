import type { Context } from "hono";
import type { AppRole } from "../../shared/constants/roles";
import { createMemberSchema, updateMemberSchema } from "../../shared/schemas/members";
import { createMemberRecord, getMembersByGroup, updateMemberRecord } from "../services/membersService";
import { sendMemberWelcomeEmail } from "../services/emailService";
import { fail, ok } from "../utils/http";

export async function listMembersByGroupController(c: Context<{ Bindings: Env }>) {
  const groupId = c.req.query("groupId");
  if (!groupId) {
    return fail(c, "groupId query parameter is required.", 400, "GROUP_ID_REQUIRED");
  }

  const members = await getMembersByGroup(c.env.DB, groupId);
  return ok(c, { members });
}

export async function createMemberController(
  c: Context<{ Bindings: Env; Variables: { authGlobalRole: AppRole } }>,
) {
  const payload = await c.req.json().catch(() => null);
  const parsed = createMemberSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(c, "Invalid member payload.", 400, "INVALID_MEMBER_PAYLOAD");
  }

  const authGlobalRole = (c.get("authGlobalRole") as AppRole | undefined) ?? "MEMBER";
  if (parsed.data.accountRole === "GROUP_ADMIN" && authGlobalRole !== "SUPER_ADMIN") {
    return fail(c, "Only Super Admin can create facility admins.", 403, "SUPER_ADMIN_REQUIRED");
  }

  const result = await createMemberRecord(c.env.DB, parsed.data);
  if (!result) {
    return fail(c, "Selected group was not found.", 404, "GROUP_NOT_FOUND");
  }

  const appBaseUrl = new URL(c.req.url).origin;
  const inviteEmailSent = await sendMemberWelcomeEmail(c.env, {
    toEmail: result.email,
    firstName: result.firstName,
    groupName: result.groupName,
    groupCode: result.groupCode,
    temporaryPassword: result.temporaryPassword,
    roleLabel: result.roleAssigned === "GROUP_ADMIN" ? "Facility Admin" : "Member",
    landingUrl: `${appBaseUrl}/`,
  });

  return ok(c, { created: true, inviteEmailSent }, 201);
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
