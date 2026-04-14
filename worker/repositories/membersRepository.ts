import type { CreateMemberInput, UpdateMemberInput } from "../../shared/schemas/members";

export type MemberListRecord = {
  membership_id: string;
  group_id: string;
  user_id: string;
  member_number: string | null;
  membership_status: "ACTIVE" | "INACTIVE" | "EXITED";
  joined_at: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
};

type CreateMemberOptions = {
  passwordHash: string;
  temporaryPassword: string;
};

export type CreateMemberResult = {
  roleAssigned: "MEMBER" | "GROUP_ADMIN";
  groupName: string;
  groupCode: string;
  firstName: string;
  email: string;
  temporaryPassword: string;
};

export async function listMembersByGroup(
  db: D1Database,
  groupId: string,
): Promise<MemberListRecord[]> {
  const result = await db
    .prepare(
      `SELECT
         gm.id AS membership_id,
         gm.group_id,
         gm.user_id,
         gm.member_number,
         gm.membership_status,
         gm.joined_at,
         u.email,
         u.first_name,
         u.last_name,
         u.phone
       FROM group_memberships gm
       INNER JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = ?1
       ORDER BY gm.created_at DESC`,
    )
    .bind(groupId)
    .all<MemberListRecord>();
  return result.results ?? [];
}

export async function createMemberWithMembership(
  db: D1Database,
  input: CreateMemberInput,
  options: CreateMemberOptions,
): Promise<CreateMemberResult | null> {
  const roleAssigned = input.accountRole === "GROUP_ADMIN" ? "GROUP_ADMIN" : "MEMBER";
  const group = await db
    .prepare("SELECT id, name, code FROM groups WHERE id = ?1 LIMIT 1")
    .bind(input.groupId)
    .first<{ id: string; name: string; code: string }>();
  if (!group) {
    return null;
  }

  const existing = await db
    .prepare("SELECT id FROM users WHERE lower(email) = lower(?1) LIMIT 1")
    .bind(input.email)
    .first<{ id: string }>();

  const userId = existing?.id ?? crypto.randomUUID();

  if (!existing) {
    await db
      .prepare(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'ACTIVE')`,
      )
      .bind(
        userId,
        input.email.toLowerCase(),
        options.passwordHash,
        input.firstName,
        input.lastName,
        input.phone ?? null,
      )
      .run();
  }

  await db
    .prepare(
      `INSERT OR IGNORE INTO group_memberships (id, group_id, user_id, member_number, membership_status)
       VALUES (?1, ?2, ?3, ?4, 'ACTIVE')`,
    )
    .bind(crypto.randomUUID(), input.groupId, userId, `M-${Date.now()}`)
    .run();

  await db
    .prepare(
      `INSERT OR IGNORE INTO group_user_roles (id, group_id, user_id, role, status)
       VALUES (?1, ?2, ?3, ?4, 'ACTIVE')`,
    )
    .bind(crypto.randomUUID(), input.groupId, userId, roleAssigned)
    .run();

  await db
    .prepare(
      `INSERT INTO member_profiles (id, user_id, gender, address)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(user_id) DO UPDATE SET
         gender = COALESCE(excluded.gender, member_profiles.gender),
         address = COALESCE(excluded.address, member_profiles.address),
         updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(crypto.randomUUID(), userId, input.gender ?? null, input.address ?? null)
    .run();

  return {
    roleAssigned,
    groupName: group.name,
    groupCode: group.code,
    firstName: input.firstName,
    email: input.email.toLowerCase(),
    temporaryPassword: options.temporaryPassword,
  };
}

export async function updateMember(
  db: D1Database,
  membershipId: string,
  input: UpdateMemberInput,
): Promise<void> {
  const membership = await db
    .prepare("SELECT user_id FROM group_memberships WHERE id = ?1 LIMIT 1")
    .bind(membershipId)
    .first<{ user_id: string }>();
  if (!membership) {
    return;
  }

  await db
    .prepare(
      `UPDATE users
       SET first_name = COALESCE(?1, first_name),
           last_name = COALESCE(?2, last_name),
           phone = COALESCE(?3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?4`,
    )
    .bind(input.firstName ?? null, input.lastName ?? null, input.phone ?? null, membership.user_id)
    .run();

  await db
    .prepare(
      `UPDATE group_memberships
       SET membership_status = COALESCE(?1, membership_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?2`,
    )
    .bind(input.membershipStatus ?? null, membershipId)
    .run();
}
