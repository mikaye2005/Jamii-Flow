import { Hono } from "hono";
import { requireAuth } from "../middlewares/authMiddleware";
import { fail, ok } from "../utils/http";

type MemberPortalVariables = {
  authUserId: string;
  authMemberships: Array<{ groupId: string; groupName: string; role: string }>;
};

export const memberPortalRoutes = new Hono<{ Bindings: Env; Variables: MemberPortalVariables }>();

memberPortalRoutes.use("*", requireAuth);

memberPortalRoutes.get("/overview", async (c) => {
  const authUserId = c.get("authUserId");
  const memberships = c.get("authMemberships") ?? [];
  const requestedGroupId = c.req.query("groupId");
  const fallbackGroupId = memberships[0]?.groupId;
  const groupId = requestedGroupId || fallbackGroupId;

  if (!groupId) {
    return fail(c, "No group context available for this member.", 400, "GROUP_CONTEXT_REQUIRED");
  }
  if (!memberships.some((membership) => membership.groupId === groupId)) {
    return fail(c, "You do not have access to this group.", 403, "FORBIDDEN_GROUP_ACCESS");
  }

  const dueItemsResult = await c.env.DB
    .prepare(
      `SELECT mdi.id, mdi.expected_amount_minor, mdi.paid_amount_minor, mdi.balance_amount_minor, mdi.due_date, mdi.status,
              cc.cycle_label
       FROM member_due_items mdi
       INNER JOIN group_memberships gm ON gm.id = mdi.group_membership_id
       LEFT JOIN contribution_cycles cc ON cc.id = mdi.contribution_cycle_id
       WHERE gm.user_id = ?1
         AND mdi.group_id = ?2
       ORDER BY mdi.due_date DESC
       LIMIT 40`,
    )
    .bind(authUserId, groupId)
    .all<{
      id: string;
      expected_amount_minor: number;
      paid_amount_minor: number;
      balance_amount_minor: number;
      due_date: string;
      status: string;
      cycle_label: string | null;
    }>();

  const paymentsResult = await c.env.DB
    .prepare(
      `SELECT id, payment_method, amount_minor, currency, payment_date, reference_code, status
       FROM payments
       WHERE payer_user_id = ?1
         AND group_id = ?2
       ORDER BY payment_date DESC, created_at DESC
       LIMIT 30`,
    )
    .bind(authUserId, groupId)
    .all<{
      id: string;
      payment_method: string;
      amount_minor: number;
      currency: string;
      payment_date: string;
      reference_code: string | null;
      status: string;
    }>();

  const notificationsResult = await c.env.DB
    .prepare(
      `SELECT id, type, title, message, status, created_at
       FROM notifications
       WHERE user_id = ?1
         AND (group_id = ?2 OR group_id IS NULL)
       ORDER BY created_at DESC
       LIMIT 30`,
    )
    .bind(authUserId, groupId)
    .all<{
      id: string;
      type: string;
      title: string;
      message: string;
      status: "UNREAD" | "READ" | "ARCHIVED";
      created_at: string;
    }>();

  const trendResult = await c.env.DB
    .prepare(
      `SELECT substr(payment_date, 1, 7) AS period, SUM(amount_minor) AS amount_minor
       FROM payments
       WHERE payer_user_id = ?1
         AND group_id = ?2
       GROUP BY substr(payment_date, 1, 7)
       ORDER BY period DESC
       LIMIT 6`,
    )
    .bind(authUserId, groupId)
    .all<{ period: string; amount_minor: number }>();

  const dueItems = dueItemsResult.results ?? [];
  const pendingArrears = dueItems.filter((item) => item.balance_amount_minor > 0);
  const payments = (paymentsResult.results ?? []).map((payment) => ({
    ...payment,
    currency: "KES",
  }));
  const totalPaidMinor = payments.reduce((sum, payment) => sum + Number(payment.amount_minor || 0), 0);
  const pendingMinor = pendingArrears.reduce((sum, item) => sum + Number(item.balance_amount_minor || 0), 0);

  return ok(c, {
    groupId,
    summary: {
      totalPaidMinor,
      pendingMinor,
      pendingItems: pendingArrears.length,
      currency: "KES",
    },
    dueItems,
    payments,
    notifications: notificationsResult.results ?? [],
    trend: (trendResult.results ?? []).reverse(),
  });
});
