import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { listReceipts } from "../../features/receipts/api";

type FilterFormValues = {
  groupId: string;
};

export function ReceiptsPage() {
  const { control, register } = useForm<FilterFormValues>({
    defaultValues: { groupId: "" },
  });
  const selectedGroupId = useWatch({ control, name: "groupId", defaultValue: "" });

  const groupsQuery = useQuery({ queryKey: ["groups"], queryFn: listGroups });
  const receiptsQuery = useQuery({
    queryKey: ["receipts", selectedGroupId],
    queryFn: () => listReceipts(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  return (
    <section>
      <h1 className="page-title">Receipts</h1>
      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Receipt Filters</h2>
        <form className="form-grid">
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
        </form>
      </article>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Receipt List</h2>
        <DataTable
          rows={receiptsQuery.data?.receipts ?? []}
          columns={[
            { key: "number", header: "Receipt No.", render: (row) => row.receipt_number },
            { key: "payment", header: "Payment ID", render: (row) => row.payment_id },
            { key: "issued", header: "Issued At", render: (row) => row.issued_at },
            {
              key: "status",
              header: "Delivery",
              render: (row) => (
                <StatusBadge
                  label={row.delivery_status}
                  tone={row.delivery_status === "SENT" ? "success" : "warning"}
                />
              ),
            },
          ]}
        />
      </article>
    </section>
  );
}
