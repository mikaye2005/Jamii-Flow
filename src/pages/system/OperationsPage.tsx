import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import {
  createReminder,
  listArrears,
  listAuditLogs,
  listNotifications,
  listPaymentWebhookLogs,
  listReminders,
} from "../../features/reminders/api";

const reminderSchema = z.object({
  groupId: z.string().min(1),
  memberDueItemId: z.string().min(1),
  reminderType: z.enum(["UPCOMING", "DUE_TODAY", "OVERDUE"]),
  scheduledFor: z.string().min(8),
  channel: z.enum(["SMS", "EMAIL", "WHATSAPP", "IN_APP"]),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

export function OperationsPage() {
  const queryClient = useQueryClient();
  const groupsQuery = useQuery({ queryKey: ["groups"], queryFn: listGroups });

  const { control, register, handleSubmit, reset } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      groupId: "",
      memberDueItemId: "",
      reminderType: "OVERDUE",
      scheduledFor: new Date().toISOString().slice(0, 10),
      channel: "SMS",
    },
  });

  const selectedGroupId = useWatch({ control, name: "groupId", defaultValue: "" });

  const arrearsQuery = useQuery({
    queryKey: ["arrears", selectedGroupId],
    queryFn: () => listArrears(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  const remindersQuery = useQuery({
    queryKey: ["reminders", selectedGroupId],
    queryFn: () => listReminders(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs", selectedGroupId],
    queryFn: () => listAuditLogs(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "usr_demo_admin"],
    queryFn: () => listNotifications("usr_demo_admin"),
  });

  const webhookLogsQuery = useQuery({
    queryKey: ["payment-webhooks"],
    queryFn: () => listPaymentWebhookLogs(80),
  });

  const createReminderMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: async () => {
      reset({
        groupId: selectedGroupId,
        memberDueItemId: "",
        reminderType: "OVERDUE",
        scheduledFor: new Date().toISOString().slice(0, 10),
        channel: "SMS",
      });
      await queryClient.invalidateQueries({ queryKey: ["reminders", selectedGroupId] });
      await queryClient.invalidateQueries({ queryKey: ["arrears", selectedGroupId] });
    },
  });

  return (
    <section>
      <h1 className="page-title">Arrears, Reminders, Notifications</h1>

      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Create Reminder</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => createReminderMutation.mutate(values))}>
          <label>
            Group
            <select {...register("groupId")}>
              <option value="">Select group</option>
              {(groupsQuery.data?.groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due Item ID
            <input {...register("memberDueItemId")} placeholder="paste member_due_item id" />
          </label>
          <label>
            Reminder Type
            <select {...register("reminderType")}>
              <option value="UPCOMING">Upcoming</option>
              <option value="DUE_TODAY">Due Today</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </label>
          <label>
            Scheduled For
            <input type="date" {...register("scheduledFor")} />
          </label>
          <label>
            Channel
            <select {...register("channel")}>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="IN_APP">In-App</option>
            </select>
          </label>
          <button className="button-primary" type="submit" disabled={createReminderMutation.isPending}>
            {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
          </button>
        </form>
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Arrears</h2>
        <DataTable
          rows={arrearsQuery.data?.arrears ?? []}
          columns={[
            { key: "member", header: "Member", render: (row) => row.member_name },
            { key: "email", header: "Email", render: (row) => row.member_email },
            { key: "due", header: "Due Date", render: (row) => row.due_date },
            { key: "balance", header: "Balance", render: (row) => row.balance_amount_minor },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={row.status === "OVERDUE" ? "danger" : row.status === "PAID" ? "success" : "warning"}
                />
              ),
            },
          ]}
        />
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Reminder Queue</h2>
        <DataTable
          rows={remindersQuery.data?.reminders ?? []}
          columns={[
            { key: "type", header: "Type", render: (row) => row.reminder_type },
            { key: "channel", header: "Channel", render: (row) => row.channel },
            { key: "scheduled", header: "Scheduled For", render: (row) => row.scheduled_for },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge label={row.status} tone={row.status === "SENT" ? "success" : "warning"} />,
            },
          ]}
        />
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Notifications (Demo User)</h2>
        <DataTable
          rows={notificationsQuery.data?.notifications ?? []}
          columns={[
            { key: "title", header: "Title", render: (row) => row.title },
            { key: "message", header: "Message", render: (row) => row.message },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge label={row.status} tone={row.status === "READ" ? "neutral" : "warning"} />
              ),
            },
          ]}
        />
      </article>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Audit Logs</h2>
        <DataTable
          rows={auditLogsQuery.data?.auditLogs ?? []}
          columns={[
            { key: "when", header: "Created At", render: (row) => row.created_at },
            { key: "action", header: "Action", render: (row) => row.action },
            { key: "entity", header: "Entity", render: (row) => `${row.entity_type} (${row.entity_id})` },
            { key: "actor", header: "Actor", render: (row) => row.actor_user_id ?? "-" },
          ]}
        />
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Payment Webhook Logs</h2>
        <DataTable
          rows={webhookLogsQuery.data?.webhooks ?? []}
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
            {
              key: "processing",
              header: "Processing",
              render: (row) => (
                <StatusBadge
                  label={row.processing_status}
                  tone={row.processing_status === "PROCESSED" ? "success" : "warning"}
                />
              ),
            },
            { key: "checkout", header: "Checkout ID", render: (row) => row.checkout_request_id ?? "-" },
            { key: "created", header: "Created At", render: (row) => row.created_at },
          ]}
        />
      </article>
    </section>
  );
}
