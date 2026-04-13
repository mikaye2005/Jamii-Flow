import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { listMyNotifications, markNotificationRead } from "../../features/reminders/api";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: listMyNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", "me"] });
    },
  });

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">Notifications</h1>
        <p>Stay updated with admin messages, payment reminders, and group announcements.</p>
      </header>

      <article className="card fade-in-up">
        <h2 className="section-title">My Notification Center</h2>
        <DataTable
          rows={notificationsQuery.data?.notifications ?? []}
          emptyTitle="No notifications yet."
          emptyHint="New reminders and notices from admins will appear here."
          columns={[
            { key: "date", header: "Date", render: (row) => row.created_at.slice(0, 10) },
            { key: "title", header: "Title", render: (row) => row.title },
            { key: "message", header: "Message", render: (row) => row.message },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge label={row.status} tone={row.status === "UNREAD" ? "warning" : "neutral"} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (row) =>
                row.status === "UNREAD" ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => markReadMutation.mutate(row.id)}
                    disabled={markReadMutation.isPending}
                  >
                    Mark Read
                  </button>
                ) : (
                  <span style={{ color: "var(--color-muted)" }}>Seen</span>
                ),
            },
          ]}
        />
      </article>
    </section>
  );
}
