type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  status: string;
};

type MemberLoginCandidate = UserRecord;

type CreateUserInput = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRecord | null> {
  const result = await db
    .prepare(
      `SELECT id, email, password_hash, first_name, last_name, status
       FROM users
       WHERE lower(email) = lower(?1)
       LIMIT 1`,
    )
    .bind(email)
    .first<UserRecord>();

  return result ?? null;
}

export async function findUserById(db: D1Database, id: string): Promise<UserRecord | null> {
  const result = await db
    .prepare(
      `SELECT id, email, password_hash, first_name, last_name, status
       FROM users
       WHERE id = ?1
       LIMIT 1`,
    )
    .bind(id)
    .first<UserRecord>();

  return result ?? null;
}

export async function createUser(db: D1Database, input: CreateUserInput): Promise<string> {
  const userId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, status)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'ACTIVE')`,
    )
    .bind(
      userId,
      input.email.toLowerCase(),
      input.passwordHash,
      input.firstName,
      input.lastName,
      input.phone ?? null,
    )
    .run();
  return userId;
}

export async function createGroupMembership(
  db: D1Database,
  groupId: string,
  userId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO group_memberships (id, group_id, user_id, member_number, membership_status)
       VALUES (?1, ?2, ?3, ?4, 'ACTIVE')`,
    )
    .bind(crypto.randomUUID(), groupId, userId, `M-${Date.now()}`)
    .run();
}

export async function findUserForMemberLogin(
  db: D1Database,
  params: {
    groupId: string;
    facilityCode: string;
    username: string;
  },
): Promise<MemberLoginCandidate | null> {
  const result = await db
    .prepare(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.status
       FROM users u
       INNER JOIN group_memberships gm ON gm.user_id = u.id
       INNER JOIN groups g ON g.id = gm.group_id
       WHERE gm.group_id = ?1
         AND gm.membership_status = 'ACTIVE'
         AND g.status = 'ACTIVE'
         AND upper(g.code) = upper(?2)
         AND (lower(u.email) = lower(?3) OR lower(COALESCE(gm.member_number, '')) = lower(?3))
       LIMIT 1`,
    )
    .bind(params.groupId, params.facilityCode, params.username.trim())
    .first<MemberLoginCandidate>();

  return result ?? null;
}
