import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../features/auth/useAuth";
import { listGroups } from "../../features/groups/api";
import { getMemberPortalOverview } from "../../features/memberPortal/api";

type MemberPortalFilterValues = {
  groupId: string;
};

export function MemberPortalPage() {
  const authQuery = useAuth();
  const user = authQuery.data?.user;
  const defaultGroupId = user?.activeGroupId ?? "";
  const { control, register } = useForm<MemberPortalFilterValues>({
    defaultValues: { groupId: defaultGroupId },
  });
  const selectedGroupId = useWatch({ control, name: "groupId", defaultValue: defaultGroupId });

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });
  const memberOverviewQuery = useQuery({
    queryKey: ["member-portal-overview", selectedGroupId],
    queryFn: () => getMemberPortalOverview(selectedGroupId || undefined),
    enabled: Boolean(user),
  });

  const trendMax = useMemo(() => {
    const values = memberOverviewQuery.data?.trend ?? [];
    return Math.max(1, ...values.map((value) => value.amount_minor));
  }, [memberOverviewQuery.data?.trend]);
  const notifications = memberOverviewQuery.data?.notifications ?? [];
  const highlightedNotifications =
    notifications.length > 0
      ? notifications.slice(0, 3)
      : [
          {
            id: "demo-late",
            type: "REMINDER",
            title: "Late Payment Reminder",
            message: "Your contribution due item is pending. Please clear your balance in time.",
            status: "UNREAD" as const,
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-update",
            type: "UPDATE",
            title: "Group Update",
            message: "Welfare admin posted a new notice for all members.",
            status: "UNREAD" as const,
            created_at: new Date().toISOString(),
          },
        ];

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">My Welfare Account</h1>
        <p>Track your KES payments, pending balances, and updates from your welfare admin.</p>
      </header>

      <article className="card form-card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Group Access</h2>
        <form className="form-grid">
          <label>
            Welfare Group
            <select {...register("groupId")}>
              <option value="">Select group</option>
              {(groupsQuery.data?.groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
        </form>
      </article>

      <div className="kpi-grid">
        <article className="kpi-card kpi-card--green">
          <h3>KES {memberOverviewQuery.data?.summary.totalPaidMinor ?? 0}</h3>
          <p>Total Paid</p>
        </article>
        <article className="kpi-card kpi-card--red">
          <h3>KES {memberOverviewQuery.data?.summary.pendingMinor ?? 0}</h3>
          <p>Pending Arrears</p>
        </article>
        <article className="kpi-card kpi-card--blue">
          <h3>{memberOverviewQuery.data?.summary.pendingItems ?? 0}</h3>
          <p>Pending Items</p>
        </article>
        <article className="kpi-card kpi-card--teal">
          <h3>KES</h3>
          <p>Currency</p>
        </article>
      </div>

      <div className="quick-actions-grid fade-in-up">
        <article className="quick-action-card">
          <div className="quick-action-head">
            <span className="icon-chip">PD</span>
            <h3 className="quick-action-title">Payment Status</h3>
          </div>
          <p className="quick-action-text">See where your latest payment has been allocated.</p>
        </article>
        <article className="quick-action-card">
          <div className="quick-action-head">
            <span className="icon-chip">AR</span>
            <h3 className="quick-action-title">Pending Arrears</h3>
          </div>
          <p className="quick-action-text">Review balances and due dates to avoid penalties.</p>
        </article>
        <article className="quick-action-card">
          <div className="quick-action-head">
            <span className="icon-chip">NT</span>
            <h3 className="quick-action-title">Notifications</h3>
          </div>
          <p className="quick-action-text">Get reminders, welfare announcements, and urgent alerts.</p>
        </article>
      </div>

      <article className="card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Important Updates</h2>
        <div className="notice-list">
          {highlightedNotifications.map((notice) => (
            <div className="notice-item" key={notice.id}>
              <div>
                <strong>{notice.title}</strong>
                <p>{notice.message}</p>
              </div>
              <StatusBadge label={notice.status} tone={notice.status === "UNREAD" ? "warning" : "neutral"} />
            </div>
          ))}
        </div>
      </article>

      <article className="card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">My Payment Trend</h2>
        <p className="section-subtext">Recent monthly contribution activity in KES.</p>
        <div className="mini-chart">
          {(memberOverviewQuery.data?.trend ?? []).map((item) => (
            <div className="mini-chart__row" key={item.period}>
              <span className="mini-chart__label">{item.period}</span>
              <div className="mini-chart__track">
                <div
                  className="mini-chart__bar"
                  style={{ width: `${Math.max(8, Math.round((item.amount_minor / trendMax) * 100))}%` }}
                />
              </div>
              <strong className="mini-chart__value">KES {item.amount_minor}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">My Payments</h2>
        <DataTable
          rows={memberOverviewQuery.data?.payments ?? []}
          emptyTitle="No personal payments yet."
          emptyHint="Your deposits will appear here once posted."
          columns={[
            { key: "date", header: "Date", render: (row) => row.payment_date },
            { key: "method", header: "Method", render: (row) => row.payment_method },
            { key: "amount", header: "Amount", render: (row) => `KES ${row.amount_minor}` },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={row.status === "POSTED" ? "success" : "warning"}
                />
              ),
            },
          ]}
        />
      </article>

      <article className="card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Pending Arrears</h2>
        <DataTable
          rows={(memberOverviewQuery.data?.dueItems ?? []).filter((item) => item.balance_amount_minor > 0)}
          emptyTitle="No pending arrears."
          emptyHint="Great job. You are currently up to date."
          columns={[
            { key: "cycle", header: "Cycle", render: (row) => row.cycle_label ?? "N/A" },
            { key: "due", header: "Due Date", render: (row) => row.due_date },
            { key: "balance", header: "Balance", render: (row) => `KES ${row.balance_amount_minor}` },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={row.status === "PAID" ? "success" : row.status === "OVERDUE" ? "danger" : "warning"}
                />
              ),
            },
          ]}
        />
      </article>

      <article className="card fade-in-up">
        <h2 className="section-title">Notifications & Admin Messages</h2>
        <DataTable
          rows={memberOverviewQuery.data?.notifications ?? []}
          emptyTitle="No notifications yet."
          emptyHint="Admin reminders and updates will appear here."
          columns={[
            { key: "date", header: "Date", render: (row) => row.created_at.slice(0, 10) },
            { key: "title", header: "Title", render: (row) => row.title },
            { key: "message", header: "Message", render: (row) => row.message },
            {
              key: "status",
              header: "State",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={row.status === "UNREAD" ? "warning" : "neutral"}
                />
              ),
            },
          ]}
        />
      </article>
    </section>
  );
}
