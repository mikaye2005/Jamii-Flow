type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  status: string;
};

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
