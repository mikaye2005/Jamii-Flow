import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { createMember, listMembers } from "../../features/members/api";

const createMemberFormSchema = z.object({
  groupId: z.string().min(1, "Select a group."),
  email: z.email("Enter a valid email."),
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().optional(),
});

type CreateMemberFormValues = z.infer<typeof createMemberFormSchema>;

export function MembersPage() {
  const queryClient = useQueryClient();
  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<CreateMemberFormValues>({
    resolver: zodResolver(createMemberFormSchema),
    defaultValues: {
      groupId: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      gender: "OTHER",
      address: "",
    },
  });

  const selectedGroupId = useWatch({
    control,
    name: "groupId",
    defaultValue: "",
  });

  const membersQuery = useQuery({
    queryKey: ["members", selectedGroupId],
    queryFn: () => listMembers(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: async () => {
      reset({
        groupId: selectedGroupId,
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        gender: "OTHER",
        address: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["members", selectedGroupId] });
    },
  });

  const onSubmit = (values: CreateMemberFormValues) => {
    createMemberMutation.mutate(values);
  };
  const members = membersQuery.data?.members ?? [];
  const activeMembers = members.filter((member) => member.membership_status === "ACTIVE").length;
  const activeRate = members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0;

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">Members</h1>
        <p>Add, organize, and monitor group membership from one place.</p>
      </header>
      <article className="card form-card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Add Member</h2>
        <p className="section-subtext">Create a profile and assign a member to the selected group.</p>
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Group
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
            Email
            <input {...register("email")} />
            {errors.email ? <small className="text-danger">{errors.email.message}</small> : null}
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
            Phone
            <input {...register("phone")} />
          </label>
          <label>
            Gender
            <select {...register("gender")}>
              <option value="OTHER">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>
          <label>
            Address
            <input {...register("address")} placeholder="Estate / town / county" />
          </label>
          <button className="button-primary" type="submit" disabled={createMemberMutation.isPending}>
            {createMemberMutation.isPending ? "Adding..." : "Add Member"}
          </button>
        </form>
      </article>

      <div className="progress-strip">
        <div className="progress-strip__head">
          <span>Active Membership Ratio</span>
          <strong>{activeRate}%</strong>
        </div>
        <div className="progress-strip__bar">
          <div className="progress-strip__fill" style={{ width: `${activeRate}%` }} />
        </div>
      </div>

      <div className="quick-actions-grid fade-in-up">
        <Link className="quick-action-card" to="/app/contributions">
          <div className="quick-action-head">
            <span className="icon-chip">CT</span>
            <h3 className="quick-action-title">Create Contribution Plan</h3>
          </div>
          <p className="quick-action-text">Define monthly dues and due dates for selected members.</p>
        </Link>
        <Link className="quick-action-card" to="/app/operations">
          <div className="quick-action-head">
            <span className="icon-chip">OP</span>
            <h3 className="quick-action-title">Run Member Ops</h3>
          </div>
          <p className="quick-action-text">Batch update statuses and synchronize member records.</p>
        </Link>
        <Link className="quick-action-card" to="/app/reports">
          <div className="quick-action-head">
            <span className="icon-chip">RP</span>
            <h3 className="quick-action-title">Membership Insights</h3>
          </div>
          <p className="quick-action-text">Review growth, inactive records, and follow-up metrics.</p>
        </Link>
      </div>

      <article className="card fade-in-up">
        <h2 className="section-title">Member Directory</h2>
        {selectedGroupId ? null : <p className="info-banner">Select a group to view members.</p>}
        {membersQuery.isLoading ? <p>Loading members...</p> : null}
        {membersQuery.isError ? <p>Failed to load members.</p> : null}
        <DataTable
          rows={membersQuery.data?.members ?? []}
          emptyTitle="No members found for this group."
          emptyHint="Add a member above to populate your member directory."
          columns={[
            {
              key: "name",
              header: "Member",
              render: (row) => `${row.first_name} ${row.last_name}`,
            },
            { key: "email", header: "Email", render: (row) => row.email },
            { key: "phone", header: "Phone", render: (row) => row.phone ?? "-" },
            { key: "member_number", header: "Member No.", render: (row) => row.member_number ?? "-" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.membership_status}
                  tone={
                    row.membership_status === "ACTIVE"
                      ? "success"
                      : row.membership_status === "INACTIVE"
                        ? "warning"
                        : "neutral"
                  }
                />
              ),
            },
          ]}
        />
      </article>
    </section>
  );
}
