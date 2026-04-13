import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { createGroup, listGroups } from "../../features/groups/api";

const createGroupFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  code: z.string().min(2, "Code is required."),
  description: z.string().optional(),
  defaultCurrency: z.string().length(3, "Use 3-letter currency code."),
});

type CreateGroupFormValues = z.infer<typeof createGroupFormSchema>;

export function GroupsPage() {
  const queryClient = useQueryClient();
  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      defaultCurrency: "KES",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const onSubmit = (values: CreateGroupFormValues) => {
    createGroupMutation.mutate(values);
  };

  return (
    <section>
      <h1 className="page-title">Groups</h1>
      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Create Group</h2>
        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Group Name
            <input {...register("name")} />
            {errors.name ? <small className="text-danger">{errors.name.message}</small> : null}
          </label>
          <label>
            Group Code
            <input {...register("code")} />
            {errors.code ? <small className="text-danger">{errors.code.message}</small> : null}
          </label>
          <label>
            Currency
            <input {...register("defaultCurrency")} />
            {errors.defaultCurrency ? (
              <small className="text-danger">{errors.defaultCurrency.message}</small>
            ) : null}
          </label>
          <label>
            Description
            <input {...register("description")} />
          </label>
          <button className="button-primary" type="submit" disabled={createGroupMutation.isPending}>
            {createGroupMutation.isPending ? "Creating..." : "Create Group"}
          </button>
        </form>
      </article>
      <article className="card">
        {groupsQuery.isLoading ? <p>Loading groups...</p> : null}
        {groupsQuery.isError ? <p>Failed to load groups.</p> : null}
        <DataTable
          rows={groupsQuery.data?.groups ?? []}
          columns={[
            { key: "name", header: "Group", render: (row) => row.name },
            { key: "code", header: "Code", render: (row) => row.code },
            { key: "currency", header: "Currency", render: (row) => row.default_currency },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  tone={
                    row.status === "ACTIVE"
                      ? "success"
                      : row.status === "PAUSED"
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
