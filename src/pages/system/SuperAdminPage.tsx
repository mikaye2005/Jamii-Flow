import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "../../components/DataTable";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { createMember } from "../../features/members/api";
import { listPaymentWebhookLogs } from "../../features/reminders/api";
import { getDashboardSummary } from "../../features/reports/api";

const createFacilityAdminSchema = z.object({
  groupId: z.string().min(1, "Select a facility."),
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  email: z.email("Valid email is required."),
  phone: z.string().optional(),
});

type CreateFacilityAdminFormValues = z.infer<typeof createFacilityAdminSchema>;

export function SuperAdminPage() {
  const queryClient = useQueryClient();
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFacilityAdminFormValues>({
    resolver: zodResolver(createFacilityAdminSchema),
    defaultValues: {
      groupId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });
  const createFacilityAdminMutation = useMutation({
    mutationFn: createMember,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const onCreateFacilityAdmin = (values: CreateFacilityAdminFormValues) => {
    createFacilityAdminMutation.mutate({
      ...values,
      phone: values.phone || undefined,
      accountRole: "GROUP_ADMIN",
    });
  };

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

      <article className="card form-card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Register Facility Admin</h2>
        <p className="section-subtext">
          Super Admin creates facility admin accounts. Credentials are sent by email with the landing page link.
        </p>
        <form className="form-grid" onSubmit={handleSubmit(onCreateFacilityAdmin)}>
          <label>
            Facility Group
            <select {...register("groupId")}>
              <option value="">Select group</option>
              {(groupsQuery.data?.groups ?? []).map((group) => (
                <option value={group.id} key={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.groupId ? <small className="text-danger">{errors.groupId.message}</small> : null}
          </label>
          <label>
            First Name
            <input {...register("firstName")} />
            {errors.firstName ? <small className="text-danger">{errors.firstName.message}</small> : null}
          </label>
          <label>
            Last Name
            <input {...register("lastName")} />
            {errors.lastName ? <small className="text-danger">{errors.lastName.message}</small> : null}
          </label>
          <label>
            Email
            <input type="email" {...register("email")} />
            {errors.email ? <small className="text-danger">{errors.email.message}</small> : null}
          </label>
          <label>
            Phone
            <input {...register("phone")} />
          </label>
          <button className="button-primary" type="submit" disabled={createFacilityAdminMutation.isPending}>
            {createFacilityAdminMutation.isPending ? "Creating..." : "Create Facility Admin"}
          </button>
          {createFacilityAdminMutation.isError ? (
            <small className="text-danger">
              Failed to create facility admin. Confirm group access and email details.
            </small>
          ) : null}
        </form>
      </article>

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
