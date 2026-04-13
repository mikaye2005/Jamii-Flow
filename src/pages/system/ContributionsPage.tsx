import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import {
  createContributionCycle,
  createContributionPlan,
  listContributionCycles,
  listContributionPlans,
  listDueItems,
} from "../../features/contributions/api";
import { listGroups } from "../../features/groups/api";

const planSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(2),
  amountMinor: z.number().int().positive(),
  currency: z.literal("KES"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "ONE_TIME"]),
  dueDay: z.number().int().min(1).max(31),
  graceDays: z.number().int().min(0).max(30),
  startDate: z.string().min(8),
});

const cycleSchema = z.object({
  contributionPlanId: z.string().min(1),
  cycleLabel: z.string().min(2),
  periodStart: z.string().min(8),
  periodEnd: z.string().min(8),
  dueDate: z.string().min(8),
});

type PlanFormValues = z.infer<typeof planSchema>;
type CycleFormValues = z.infer<typeof cycleSchema>;

export function ContributionsPage() {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });

  const {
    control: planControl,
    register: registerPlan,
    handleSubmit: handlePlanSubmit,
    reset: resetPlan,
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      groupId: "",
      name: "",
      amountMinor: 1000,
      currency: "KES",
      frequency: "MONTHLY",
      dueDay: 5,
      graceDays: 0,
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedGroupId = useWatch({
    control: planControl,
    name: "groupId",
    defaultValue: "",
  });

  const plansQuery = useQuery({
    queryKey: ["contribution-plans", selectedGroupId],
    queryFn: () => listContributionPlans(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  const {
    control: cycleControl,
    register: registerCycle,
    handleSubmit: handleCycleSubmit,
    reset: resetCycle,
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      contributionPlanId: "",
      cycleLabel: "",
      periodStart: new Date().toISOString().slice(0, 10),
      periodEnd: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedPlanId = useWatch({
    control: cycleControl,
    name: "contributionPlanId",
    defaultValue: "",
  });

  const cyclesQuery = useQuery({
    queryKey: ["contribution-cycles", selectedPlanId],
    queryFn: () => listContributionCycles(selectedPlanId),
    enabled: selectedPlanId.length > 0,
  });

  const selectedCycleId = cyclesQuery.data?.cycles?.[0]?.id ?? "";
  const dueItemsQuery = useQuery({
    queryKey: ["due-items", selectedCycleId],
    queryFn: () => listDueItems(selectedCycleId),
    enabled: selectedCycleId.length > 0,
  });

  const createPlanMutation = useMutation({
    mutationFn: createContributionPlan,
    onSuccess: async () => {
      resetPlan({
        groupId: selectedGroupId,
        name: "",
        amountMinor: 1000,
        currency: "KES",
        frequency: "MONTHLY",
        dueDay: 5,
        graceDays: 0,
        startDate: new Date().toISOString().slice(0, 10),
      });
      await queryClient.invalidateQueries({ queryKey: ["contribution-plans", selectedGroupId] });
    },
  });

  const createCycleMutation = useMutation({
    mutationFn: createContributionCycle,
    onSuccess: async () => {
      resetCycle({
        contributionPlanId: selectedPlanId,
        cycleLabel: "",
        periodStart: new Date().toISOString().slice(0, 10),
        periodEnd: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
      });
      await queryClient.invalidateQueries({ queryKey: ["contribution-cycles", selectedPlanId] });
    },
  });

  return (
    <section>
      <h1 className="page-title">Contributions</h1>
      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Create Contribution Plan</h2>
        <form
          className="form-grid"
          onSubmit={handlePlanSubmit((values) =>
            createPlanMutation.mutate({
              ...values,
              amountMinor: Number(values.amountMinor),
              dueDay: values.dueDay ? Number(values.dueDay) : undefined,
              graceDays: Number(values.graceDays),
            }),
          )}
        >
          <label>
            Group
            <select {...registerPlan("groupId")}>
              <option value="">Select group</option>
              {(groupsQuery.data?.groups ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Plan Name
            <input {...registerPlan("name")} />
          </label>
          <label>
            Amount (minor units)
            <input type="number" {...registerPlan("amountMinor", { valueAsNumber: true })} />
          </label>
          <label>
            Currency
            <input {...registerPlan("currency")} readOnly />
          </label>
          <label>
            Frequency
            <select {...registerPlan("frequency")}>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="ONE_TIME">One-time</option>
            </select>
          </label>
          <label>
            Due Day
            <input type="number" {...registerPlan("dueDay", { valueAsNumber: true })} />
          </label>
          <label>
            Grace Days
            <input type="number" {...registerPlan("graceDays", { valueAsNumber: true })} />
          </label>
          <label>
            Start Date
            <input type="date" {...registerPlan("startDate")} />
          </label>
          <button className="button-primary" type="submit" disabled={createPlanMutation.isPending}>
            {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
          </button>
        </form>
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Contribution Plans</h2>
        <DataTable
          rows={plansQuery.data?.plans ?? []}
          columns={[
            { key: "name", header: "Plan", render: (row) => row.name },
            { key: "frequency", header: "Frequency", render: (row) => row.frequency },
            { key: "amount", header: "Amount", render: (row) => row.amount_minor },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge label={row.status} tone={row.status === "ACTIVE" ? "success" : "warning"} />
              ),
            },
          ]}
        />
      </article>

      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Create Contribution Cycle</h2>
        <form className="form-grid" onSubmit={handleCycleSubmit((values) => createCycleMutation.mutate(values))}>
          <label>
            Contribution Plan
            <select {...registerCycle("contributionPlanId")}>
              <option value="">Select plan</option>
              {(plansQuery.data?.plans ?? []).map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cycle Label
            <input {...registerCycle("cycleLabel")} placeholder="Aug 2026" />
          </label>
          <label>
            Period Start
            <input type="date" {...registerCycle("periodStart")} />
          </label>
          <label>
            Period End
            <input type="date" {...registerCycle("periodEnd")} />
          </label>
          <label>
            Due Date
            <input type="date" {...registerCycle("dueDate")} />
          </label>
          <button className="button-primary" type="submit" disabled={createCycleMutation.isPending}>
            {createCycleMutation.isPending ? "Creating..." : "Create Cycle"}
          </button>
        </form>
      </article>

      <article className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Contribution Cycles</h2>
        <DataTable
          rows={cyclesQuery.data?.cycles ?? []}
          columns={[
            { key: "label", header: "Cycle", render: (row) => row.cycle_label },
            { key: "period", header: "Period", render: (row) => `${row.period_start} to ${row.period_end}` },
            { key: "due", header: "Due Date", render: (row) => row.due_date },
            { key: "expected", header: "Expected", render: (row) => row.expected_amount_minor },
          ]}
        />
      </article>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Generated Due Items (Latest Cycle)</h2>
        <DataTable
          rows={dueItemsQuery.data?.dueItems ?? []}
          columns={[
            { key: "membership", header: "Membership ID", render: (row) => row.group_membership_id },
            { key: "expected", header: "Expected", render: (row) => row.expected_amount_minor },
            { key: "balance", header: "Balance", render: (row) => row.balance_amount_minor },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge label={row.status} tone={row.status === "PENDING" ? "warning" : "success"} />,
            },
          ]}
        />
      </article>
    </section>
  );
}
