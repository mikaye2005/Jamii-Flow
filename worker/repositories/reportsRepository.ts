export type DashboardSummary = {
  total_groups: number;
  total_members: number;
  total_payments_minor: number;
  arrears_items: number;
};

export type CollectionTrendRow = {
  period_label: string;
  amount_minor: number;
};

export type GroupPerformanceRow = {
  group_id: string;
  group_name: string;
  members_count: number;
  collected_minor: number;
  arrears_minor: number;
};

export async function getDashboardSummary(
  db: D1Database,
  groupId?: string,
): Promise<DashboardSummary> {
  const filters = groupId ? "WHERE g.id = ?1" : "";
  const bindings = groupId ? [groupId] : [];

  const groups = await db
    .prepare(`SELECT COUNT(*) as total_groups FROM groups g ${filters}`)
    .bind(...bindings)
    .first<{ total_groups: number }>();

  const members = await db
    .prepare(
      `SELECT COUNT(*) as total_members
       FROM group_memberships gm
       INNER JOIN groups g ON g.id = gm.group_id
       ${filters}`,
    )
    .bind(...bindings)
    .first<{ total_members: number }>();

  const payments = await db
    .prepare(
      `SELECT COALESCE(SUM(p.amount_minor), 0) as total_payments_minor
       FROM payments p
       INNER JOIN groups g ON g.id = p.group_id
       ${filters}`,
    )
    .bind(...bindings)
    .first<{ total_payments_minor: number }>();

  const arrears = await db
    .prepare(
      `SELECT COUNT(*) as arrears_items
       FROM member_due_items mdi
       INNER JOIN groups g ON g.id = mdi.group_id
       ${filters === "" ? "WHERE" : "AND"} mdi.balance_amount_minor > 0`,
    )
    .bind(...bindings)
    .first<{ arrears_items: number }>();

  return {
    total_groups: Number(groups?.total_groups ?? 0),
    total_members: Number(members?.total_members ?? 0),
    total_payments_minor: Number(payments?.total_payments_minor ?? 0),
    arrears_items: Number(arrears?.arrears_items ?? 0),
  };
}

export async function getCollectionTrend(
  db: D1Database,
  months = 6,
  groupId?: string,
): Promise<CollectionTrendRow[]> {
  const params: (string | number)[] = [months];
  let groupFilter = "";
  if (groupId) {
    params.push(groupId);
    groupFilter = "AND p.group_id = ?2";
  }

  const result = await db
    .prepare(
      `SELECT
         strftime('%Y-%m', p.payment_date) AS period_label,
         COALESCE(SUM(p.amount_minor), 0) AS amount_minor
       FROM payments p
       WHERE p.payment_date >= date('now', '-' || ?1 || ' months')
         ${groupFilter}
       GROUP BY strftime('%Y-%m', p.payment_date)
       ORDER BY period_label ASC`,
    )
    .bind(...params)
    .all<CollectionTrendRow>();

  return result.results ?? [];
}

export async function getGroupPerformance(
  db: D1Database,
  months = 3,
): Promise<GroupPerformanceRow[]> {
  const result = await db
    .prepare(
      `SELECT
         g.id AS group_id,
         g.name AS group_name,
         COALESCE(m.members_count, 0) AS members_count,
         COALESCE(p.collected_minor, 0) AS collected_minor,
         COALESCE(a.arrears_minor, 0) AS arrears_minor
       FROM groups g
       LEFT JOIN (
         SELECT group_id, COUNT(*) AS members_count
         FROM group_memberships
         GROUP BY group_id
       ) m ON m.group_id = g.id
       LEFT JOIN (
         SELECT group_id, SUM(amount_minor) AS collected_minor
         FROM payments
         WHERE payment_date >= date('now', '-' || ?1 || ' months')
         GROUP BY group_id
       ) p ON p.group_id = g.id
       LEFT JOIN (
         SELECT group_id, SUM(balance_amount_minor) AS arrears_minor
         FROM member_due_items
         WHERE balance_amount_minor > 0
         GROUP BY group_id
       ) a ON a.group_id = g.id
       ORDER BY collected_minor DESC, arrears_minor DESC`,
    )
    .bind(months)
    .all<GroupPerformanceRow>();

  return result.results ?? [];
}
