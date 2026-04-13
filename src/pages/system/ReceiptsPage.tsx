import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
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
  const receipts = receiptsQuery.data?.receipts ?? [];
  const sentCount = receipts.filter((receipt) => receipt.delivery_status === "SENT").length;
  const sentRate = receipts.length > 0 ? Math.round((sentCount / receipts.length) * 100) : 0;

  return (
    <section>
      <header className="page-hero fade-in-up">
        <h1 className="page-title">Receipts</h1>
        <p>Monitor issuance and delivery status for every payment receipt.</p>
      </header>
      <article className="card form-card fade-in-up" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Receipt Filters</h2>
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

      <div className="progress-strip">
        <div className="progress-strip__head">
          <span>Receipt Delivery Success</span>
          <strong>{sentRate}%</strong>
        </div>
        <div className="progress-strip__bar">
          <div className="progress-strip__fill" style={{ width: `${sentRate}%` }} />
        </div>
      </div>

      <div className="quick-actions-grid fade-in-up">
        <Link className="quick-action-card" to="/app/payments">
          <div className="quick-action-head">
            <span className="icon-chip">PY</span>
            <h3 className="quick-action-title">Capture New Payment</h3>
          </div>
          <p className="quick-action-text">Create payments so receipts can be generated and delivered.</p>
        </Link>
        <Link className="quick-action-card" to="/app/operations">
          <div className="quick-action-head">
            <span className="icon-chip">OP</span>
            <h3 className="quick-action-title">Run Delivery Follow-up</h3>
          </div>
          <p className="quick-action-text">Investigate pending deliveries and reattempt where needed.</p>
        </Link>
        <Link className="quick-action-card" to="/app/reports">
          <div className="quick-action-head">
            <span className="icon-chip">RP</span>
            <h3 className="quick-action-title">Receipt Audit</h3>
          </div>
          <p className="quick-action-text">Review proof-of-payment history and issuance activity.</p>
        </Link>
      </div>

      <article className="card fade-in-up">
        <h2 className="section-title">Receipt List</h2>
        {selectedGroupId ? null : <p className="info-banner">Select a group to load receipts.</p>}
        <DataTable
          rows={receiptsQuery.data?.receipts ?? []}
          emptyTitle="No receipts generated yet."
          emptyHint="Receipts appear after successful payment posting."
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
