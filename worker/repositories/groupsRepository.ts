import type { CreateGroupInput, UpdateGroupInput } from "../../shared/schemas/groups";

export type GroupRecord = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  default_currency: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  created_at: string;
};

export async function listGroups(db: D1Database): Promise<GroupRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, name, code, description, default_currency, status, created_at
       FROM groups
       ORDER BY created_at DESC`,
    )
    .all<GroupRecord>();
  return result.results ?? [];
}

export async function listActiveGroupsPublic(db: D1Database): Promise<GroupRecord[]> {
  const result = await db
    .prepare(
      `SELECT id, name, code, description, default_currency, status, created_at
       FROM groups
       WHERE status = 'ACTIVE'
       ORDER BY name ASC`,
    )
    .all<GroupRecord>();
  return result.results ?? [];
}

export async function findGroupById(db: D1Database, id: string): Promise<GroupRecord | null> {
  const result = await db
    .prepare(
      `SELECT id, name, code, description, default_currency, status, created_at
       FROM groups
       WHERE id = ?1
       LIMIT 1`,
    )
    .bind(id)
    .first<GroupRecord>();
  return result ?? null;
}

export async function createGroup(
  db: D1Database,
  input: CreateGroupInput,
  createdByUserId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO groups (id, name, code, description, default_currency, created_by_user_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      crypto.randomUUID(),
      input.name,
      input.code.toUpperCase(),
      input.description ?? null,
      input.defaultCurrency.toUpperCase(),
      createdByUserId,
    )
    .run();
}

export async function updateGroup(db: D1Database, groupId: string, input: UpdateGroupInput): Promise<void> {
  const payload = {
    name: input.name ?? null,
    code: input.code?.toUpperCase() ?? null,
    description: input.description ?? null,
    defaultCurrency: input.defaultCurrency?.toUpperCase() ?? null,
  };

  await db
    .prepare(
      `UPDATE groups
       SET name = COALESCE(?1, name),
           code = COALESCE(?2, code),
           description = COALESCE(?3, description),
           default_currency = COALESCE(?4, default_currency),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?5`,
    )
    .bind(payload.name, payload.code, payload.description, payload.defaultCurrency, groupId)
    .run();
}
