type SessionRecord = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
};

export async function createSession(
  db: D1Database,
  params: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    ipAddress: string | null;
    userAgent: string | null;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      params.id,
      params.userId,
      params.tokenHash,
      params.expiresAt,
      params.ipAddress,
      params.userAgent,
    )
    .run();
}

export async function findActiveSessionByTokenHash(
  db: D1Database,
  tokenHash: string,
): Promise<SessionRecord | null> {
  const result = await db
    .prepare(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
       FROM sessions
       WHERE token_hash = ?1
         AND revoked_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
    )
    .bind(tokenHash)
    .first<SessionRecord>();

  return result ?? null;
}

export async function revokeSessionByTokenHash(db: D1Database, tokenHash: string): Promise<void> {
  await db
    .prepare(
      `UPDATE sessions
       SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE token_hash = ?1 AND revoked_at IS NULL`,
    )
    .bind(tokenHash)
    .run();
}
