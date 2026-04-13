import type { AppRole } from "../../shared/constants/roles";

export type UserGroupMembershipAccess = {
  groupId: string;
  groupName: string;
  role: AppRole;
};

type MembershipRow = {
  group_id: string;
  group_name: string;
  role_rank: number;
};

function rankToRole(rank: number): AppRole {
  if (rank >= 3) {
    return "GROUP_ADMIN";
  }
  if (rank >= 2) {
    return "TREASURER";
  }
  return "MEMBER";
}

export async function listUserGroupAccess(
  db: D1Database,
  userId: string,
): Promise<UserGroupMembershipAccess[]> {
  const result = await db
    .prepare(
      `SELECT
         gm.group_id,
         g.name AS group_name,
         COALESCE(MAX(
           CASE gur.role
             WHEN 'GROUP_ADMIN' THEN 3
             WHEN 'TREASURER' THEN 2
             WHEN 'MEMBER' THEN 1
             ELSE 1
           END
         ), 1) AS role_rank
       FROM group_memberships gm
       INNER JOIN groups g ON g.id = gm.group_id
       LEFT JOIN group_user_roles gur
         ON gur.group_id = gm.group_id
         AND gur.user_id = gm.user_id
         AND gur.status = 'ACTIVE'
       WHERE gm.user_id = ?1
         AND gm.membership_status = 'ACTIVE'
       GROUP BY gm.group_id, g.name
       ORDER BY g.name ASC`,
    )
    .bind(userId)
    .all<MembershipRow>();

  return (result.results ?? []).map((row) => ({
    groupId: row.group_id,
    groupName: row.group_name,
    role: rankToRole(Number(row.role_rank || 1)),
  }));
}
