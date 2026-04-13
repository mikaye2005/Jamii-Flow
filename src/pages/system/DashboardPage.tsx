import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/DataTable";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { apiGet } from "../../lib/apiClient";

type HealthPayload = {
  status: string;
  service: string;
  timestamp: string;
};

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<HealthPayload>("/api/health"),
  });

  return (
    <section>
      <h1 className="page-title">Dashboard</h1>

      <div className="kpi-grid">
        <StatCard title="Active Groups" value="46" tone="teal" />
        <StatCard title="Total Members" value="365" tone="blue" />
        <StatCard title="Contributions" value="34,018" tone="green" />
        <StatCard title="Defaulters" value="71" tone="red" />
      </div>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Upcoming Collections</h2>
        <DataTable
          rows={[
            { group: "John Savers", members: 120, date: "15 Aug 2026", status: "Active" },
            { group: "Unity Welfare", members: 87, date: "28 Aug 2026", status: "Pending" },
            { group: "Hope Circle", members: 42, date: "31 Aug 2026", status: "Delayed" },
          ]}
          columns={[
            { key: "group", header: "Group", render: (row) => row.group },
            { key: "members", header: "Members", render: (row) => row.members },
            { key: "date", header: "Next Collection", render: (row) => row.date },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={
                    row.status === "Active"
                      ? "success"
                      : row.status === "Pending"
                        ? "warning"
                        : "danger"
                  }
                />
              ),
            },
          ]}
        />
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>API Health</h2>
        {healthQuery.isLoading ? <p>Checking API health...</p> : null}
        {healthQuery.isError ? <p>API health check failed.</p> : null}
        {healthQuery.data ? <pre>{JSON.stringify(healthQuery.data, null, 2)}</pre> : null}
      </article>
    </section>
  );
}
