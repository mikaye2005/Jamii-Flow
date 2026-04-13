import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { DataTable } from "../../components/DataTable";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { getCollectionTrend, getDashboardSummary } from "../../features/reports/api";

type FilterValues = {
  groupId: string;
  months: number;
};

export function DashboardPage() {
  const { control, register } = useForm<FilterValues>({
    defaultValues: {
      groupId: "",
      months: 6,
    },
  });
  const selectedGroupId = useWatch({ control, name: "groupId", defaultValue: "" });
  const selectedMonths = useWatch({ control, name: "months", defaultValue: 6 });

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });

  const summaryQuery = useQuery({
    queryKey: ["report-summary", selectedGroupId],
    queryFn: () => getDashboardSummary(selectedGroupId || undefined),
  });

  const trendQuery = useQuery({
    queryKey: ["report-trend", selectedGroupId, selectedMonths],
    queryFn: () => getCollectionTrend(selectedMonths, selectedGroupId || undefined),
  });

  return (
    <section>
      <h1 className="page-title">Dashboard</h1>

      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Interactive Filters</h2>
        <form className="form-grid">
          <label>
            Group Scope
            <select {...register("groupId")}>
              <option value="">All groups</option>
              {(groupsQuery.data?.groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trend Months
            <select {...register("months", { valueAsNumber: true })}>
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </label>
        </form>
      </article>

      <div className="kpi-grid">
        <StatCard
          title="Active Groups"
          value={String(summaryQuery.data?.summary.total_groups ?? 0)}
          tone="teal"
        />
        <StatCard
          title="Total Members"
          value={String(summaryQuery.data?.summary.total_members ?? 0)}
          tone="blue"
        />
        <StatCard
          title="Collections"
          value={String(summaryQuery.data?.summary.total_payments_minor ?? 0)}
          tone="green"
        />
        <StatCard
          title="Defaulters"
          value={String(summaryQuery.data?.summary.arrears_items ?? 0)}
          tone="red"
        />
      </div>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Collection Trend (Interactive)</h2>
        <DataTable
          rows={trendQuery.data?.trend ?? []}
          columns={[
            { key: "period", header: "Period", render: (row) => row.period_label },
            { key: "amount", header: "Collected (minor)", render: (row) => row.amount_minor },
            {
              key: "status",
              header: "Momentum",
              render: (row) => (
                <StatusBadge
                  label={row.amount_minor > 0 ? "Active" : "No Activity"}
                  tone={row.amount_minor > 0 ? "success" : "neutral"}
                />
              ),
            },
          ]}
        />
      </article>
    </section>
  );
}
