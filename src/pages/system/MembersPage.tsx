import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
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
      });
      await queryClient.invalidateQueries({ queryKey: ["members", selectedGroupId] });
    },
  });

  const onSubmit = (values: CreateMemberFormValues) => {
    createMemberMutation.mutate(values);
  };

  return (
    <section>
      <h1 className="page-title">Members</h1>
      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Add Member</h2>
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
          <button className="button-primary" type="submit" disabled={createMemberMutation.isPending}>
            {createMemberMutation.isPending ? "Adding..." : "Add Member"}
          </button>
        </form>
      </article>

      <article className="card">
        {selectedGroupId ? null : <p>Select a group to view members.</p>}
        {membersQuery.isLoading ? <p>Loading members...</p> : null}
        {membersQuery.isError ? <p>Failed to load members.</p> : null}
        <DataTable
          rows={membersQuery.data?.members ?? []}
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
