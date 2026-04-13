type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  status: string;
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
