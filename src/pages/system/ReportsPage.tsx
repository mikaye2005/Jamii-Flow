import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { getCollectionTrend, getGroupPerformance } from "../../features/reports/api";

type ReportFilters = {
  months: number;
};

export function ReportsPage() {
  const { control, register } = useForm<ReportFilters>({
    defaultValues: { months: 3 },
  });
  const months = useWatch({ control, name: "months", defaultValue: 3 });

  const groupPerformanceQuery = useQuery({
    queryKey: ["report-group-performance", months],
    queryFn: () => getGroupPerformance(months),
  });

  const trendQuery = useQuery({
    queryKey: ["report-collections", months],
    queryFn: () => getCollectionTrend(months),
  });

  return (
    <section>
      <h1 className="page-title">Reports</h1>
      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Report Filters</h2>
        <form className="form-grid">
          <label>
            Time Window
            <select {...register("months", { valueAsNumber: true })}>
              <option value={1}>Last 1 month</option>
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </label>
        </form>
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Group Performance</h2>
        <DataTable
          rows={groupPerformanceQuery.data?.performance ?? []}
          columns={[
            { key: "group", header: "Group", render: (row) => row.group_name },
            { key: "members", header: "Members", render: (row) => row.members_count },
            { key: "collected", header: "Collected", render: (row) => row.collected_minor },
            { key: "arrears", header: "Arrears", render: (row) => row.arrears_minor },
            {
              key: "health",
              header: "Health",
              render: (row) => (
                <StatusBadge
                  label={row.arrears_minor > row.collected_minor ? "At Risk" : "Healthy"}
                  tone={row.arrears_minor > row.collected_minor ? "danger" : "success"}
                />
              ),
            },
          ]}
        />
      </article>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Collection Trend</h2>
        <DataTable
          rows={trendQuery.data?.trend ?? []}
          columns={[
            { key: "period", header: "Period", render: (row) => row.period_label },
            { key: "amount", header: "Collected", render: (row) => row.amount_minor },
            {
              key: "activity",
              header: "Activity",
              render: (row) => (
                <StatusBadge label={row.amount_minor > 0 ? "Active" : "No Activity"} tone="neutral" />
              ),
            },
          ]}
        />
      </article>
    </section>
  );
}
