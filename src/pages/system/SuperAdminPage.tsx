import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/DataTable";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { listPaymentWebhookLogs } from "../../features/reminders/api";
import { getDashboardSummary } from "../../features/reports/api";

export function SuperAdminPage() {
  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });
  const summaryQuery = useQuery({
    queryKey: ["super-admin-summary"],
    queryFn: () => getDashboardSummary(),
  });
  const webhooksQuery = useQuery({
    queryKey: ["super-admin-webhooks"],
    queryFn: () => listPaymentWebhookLogs(50),
  });

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">Super Admin Control Center</h1>
        <p>Global oversight for groups, system health, collections, and webhook processing.</p>
      </header>

      <div className="kpi-grid">
        <StatCard title="Total Groups" value={String(summaryQuery.data?.summary.total_groups ?? 0)} tone="teal" />
        <StatCard title="Total Members" value={String(summaryQuery.data?.summary.total_members ?? 0)} tone="blue" />
        <StatCard
          title="Total Collections (KES)"
          value={String(summaryQuery.data?.summary.total_payments_minor ?? 0)}
          tone="green"
        />
        <StatCard title="Open Arrears" value={String(summaryQuery.data?.summary.arrears_items ?? 0)} tone="red" />
      </div>

      <article className="card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">All Welfare Groups</h2>
        <DataTable
          rows={groupsQuery.data?.groups ?? []}
          emptyTitle="No groups available."
          emptyHint="Create groups to start onboarding welfare communities."
          columns={[
            { key: "name", header: "Group", render: (row) => row.name },
            { key: "code", header: "Code", render: (row) => row.code },
            { key: "currency", header: "Currency", render: () => "KES" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={row.status === "ACTIVE" ? "success" : row.status === "PAUSED" ? "warning" : "neutral"}
                />
              ),
            },
          ]}
        />
      </article>

      <article className="card fade-in-up">
        <h2 className="section-title">Recent Payment Webhook Logs</h2>
        <DataTable
          rows={webhooksQuery.data?.webhooks ?? []}
          emptyTitle="No webhook logs available."
          emptyHint="M-Pesa callback logs will appear here once transactions arrive."
          columns={[
            { key: "provider", header: "Provider", render: (row) => row.provider },
            { key: "event", header: "Event", render: (row) => row.event_type },
            {
              key: "verification",
              header: "Verification",
              render: (row) => (
                <StatusBadge
                  label={row.verification_status}
                  tone={row.verification_status === "VERIFIED" ? "success" : "danger"}
                />
              ),
            },
            { key: "processing", header: "Processing", render: (row) => row.processing_status },
            { key: "time", header: "Created At", render: (row) => row.created_at },
          ]}
        />
      </article>
    </section>
  );
}
