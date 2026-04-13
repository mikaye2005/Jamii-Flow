import { useAuth } from "../../features/auth/useAuth";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";

export function MemberSettingsPage() {
  const authQuery = useAuth();
  const user = authQuery.data?.user;

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">My Profile & Settings</h1>
        <p>Manage your account details and view your welfare memberships.</p>
      </header>

      <div className="quick-actions-grid fade-in-up">
        <article className="quick-action-card">
          <div className="quick-action-head">
            <span className="icon-chip">NM</span>
            <h3 className="quick-action-title">Name</h3>
          </div>
          <p className="quick-action-text">{user ? `${user.firstName} ${user.lastName}` : "-"}</p>
        </article>
        <article className="quick-action-card">
          <div className="quick-action-head">
            <span className="icon-chip">EM</span>
            <h3 className="quick-action-title">Email</h3>
          </div>
          <p className="quick-action-text">{user?.email ?? "-"}</p>
        </article>
        <article className="quick-action-card">
          <div className="quick-action-head">
            <span className="icon-chip">RL</span>
            <h3 className="quick-action-title">Global Role</h3>
          </div>
          <p className="quick-action-text">{user?.globalRole ?? "-"}</p>
        </article>
      </div>

      <article className="card fade-in-up">
        <h2 className="section-title">Group Memberships</h2>
        <DataTable
          rows={user?.memberships ?? []}
          emptyTitle="No memberships found."
          emptyHint="Your group admin can assign you to one or more welfare groups."
          columns={[
            { key: "group", header: "Group", render: (row) => row.groupName },
            { key: "id", header: "Group ID", render: (row) => row.groupId },
            {
              key: "role",
              header: "Role",
              render: (row) => (
                <StatusBadge
                  label={row.role}
                  tone={row.role === "GROUP_ADMIN" ? "success" : row.role === "TREASURER" ? "warning" : "neutral"}
                />
              ),
            },
          ]}
        />
      </article>
    </section>
  );
}
