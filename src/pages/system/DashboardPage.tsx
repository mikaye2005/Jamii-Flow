import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { getCollectionTrend, getDashboardSummary } from "../../features/reports/api";
import { useAuth } from "../../features/auth/useAuth";

type FilterValues = {
  groupId: string;
  months: number;
};

export function DashboardPage() {
  const authQuery = useAuth();
  const defaultGroupId = authQuery.data?.user?.activeGroupId ?? "";
  const { control, register, setValue } = useForm<FilterValues>({
    defaultValues: {
      groupId: defaultGroupId,
      months: 6,
    },
  });
  const selectedGroupId = useWatch({ control, name: "groupId", defaultValue: "" });
  const selectedMonths = useWatch({ control, name: "months", defaultValue: 6 });

  useEffect(() => {
    if (defaultGroupId) {
      setValue("groupId", defaultGroupId, { shouldDirty: false });
    }
  }, [defaultGroupId, setValue]);

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
  const summary = summaryQuery.data?.summary;
  const totalMembers = summary?.total_members ?? 0;
  const defaulters = summary?.arrears_items ?? 0;
  const compliancePercent = totalMembers > 0 ? Math.max(0, Math.round(((totalMembers - defaulters) / totalMembers) * 100)) : 0;

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">Dashboard</h1>
        <p>Track collections, member activity, and welfare momentum across your groups.</p>
      </header>

      <article className="card form-card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Interactive Filters</h2>
        <p className="section-subtext">Adjust scope and timeline to explore real-time trends.</p>
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

      <div className="progress-strip">
        <div className="progress-strip__head">
          <span>Contribution Compliance</span>
          <strong>{compliancePercent}%</strong>
        </div>
        <div className="progress-strip__bar">
          <div className="progress-strip__fill" style={{ width: `${compliancePercent}%` }} />
        </div>
      </div>

      <div className="quick-actions-grid fade-in-up">
        <Link className="quick-action-card" to="/app/members">
          <div className="quick-action-head">
            <span className="icon-chip">MB</span>
            <h3 className="quick-action-title">Manage Members</h3>
          </div>
          <p className="quick-action-text">Onboard or update member details for active groups.</p>
        </Link>
        <Link className="quick-action-card" to="/app/payments">
          <div className="quick-action-head">
            <span className="icon-chip">PY</span>
            <h3 className="quick-action-title">Record Deposit</h3>
          </div>
          <p className="quick-action-text">Capture payment and trigger M-Pesa prompt quickly.</p>
        </Link>
        <Link className="quick-action-card" to="/app/reports">
          <div className="quick-action-head">
            <span className="icon-chip">RP</span>
            <h3 className="quick-action-title">View Reports</h3>
          </div>
          <p className="quick-action-text">Track contribution trends and arrears performance.</p>
        </Link>
      </div>

      <article className="card fade-in-up">
        <h2 className="section-title">Collection Trend (Interactive)</h2>
        <p className="section-subtext">
          {trendQuery.isLoading ? "Loading latest trend data..." : "Review monthly collection performance."}
        </p>
        <DataTable
          rows={trendQuery.data?.trend ?? []}
          emptyTitle="No trend data available yet."
          emptyHint="Try a different group scope or period to load activity."
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
