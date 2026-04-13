import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { listGroups } from "../../features/groups/api";
import { createPayment, initiateMpesaStkPush, listPayments } from "../../features/payments/api";

const paymentSchema = z.object({
  groupId: z.string().min(1),
  payerUserId: z.string().min(1),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "OTHER"]),
  referenceCode: z.string().optional(),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  paymentDate: z.string().min(8),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;
type PendingPaymentPayload = {
  groupId: string;
  payerUserId: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "OTHER";
  referenceCode?: string;
  amountMinor: number;
  currency: string;
  paymentDate: string;
  notes?: string;
  allocations: Array<{
    memberDueItemId: string;
    allocatedAmountMinor: number;
  }>;
};

function normalizeMpesaPhone(phone: string) {
  const onlyDigits = phone.replace(/\D/g, "");
  if (onlyDigits.startsWith("0") && onlyDigits.length === 10) {
    return `254${onlyDigits.slice(1)}`;
  }
  if (onlyDigits.startsWith("254") && onlyDigits.length === 12) {
    return onlyDigits;
  }
  return onlyDigits;
}

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const [pendingMpesaPayload, setPendingMpesaPayload] = useState<PendingPaymentPayload | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("07");
  const [mpesaPromptError, setMpesaPromptError] = useState<string | null>(null);
  const groupsQuery = useQuery({ queryKey: ["groups"], queryFn: listGroups });

  const { control, register, handleSubmit, reset } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      groupId: "",
      payerUserId: "",
      paymentMethod: "MOBILE_MONEY",
      referenceCode: "",
      amountMinor: 1000,
      currency: "KES",
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const selectedGroupId = useWatch({ control, name: "groupId", defaultValue: "" });
  const paymentsQuery = useQuery({
    queryKey: ["payments", selectedGroupId],
    queryFn: () => listPayments(selectedGroupId),
    enabled: selectedGroupId.length > 0,
  });

  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: async () => {
      reset({
        groupId: selectedGroupId,
        payerUserId: "",
        paymentMethod: "MOBILE_MONEY",
        referenceCode: "",
        amountMinor: 1000,
        currency: "KES",
        paymentDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["payments", selectedGroupId] });
      await queryClient.invalidateQueries({ queryKey: ["receipts", selectedGroupId] });
    },
  });

  const mpesaStkMutation = useMutation({
    mutationFn: initiateMpesaStkPush,
  });

  const submitPayment = (payload: PendingPaymentPayload) => {
    createPaymentMutation.mutate(payload);
  };

  const handlePaymentSubmit = (values: PaymentFormValues) => {
    const payload: PendingPaymentPayload = {
      ...values,
      amountMinor: Number(values.amountMinor),
      allocations: [],
    };

    if (values.paymentMethod === "MOBILE_MONEY") {
      setPendingMpesaPayload(payload);
      setMpesaPromptError(null);
      return;
    }

    submitPayment(payload);
  };

  const confirmMpesaPrompt = () => {
    if (!pendingMpesaPayload) {
      return;
    }

    const normalizedPhone = normalizeMpesaPhone(mpesaPhone);
    if (!/^2547\d{8}$/.test(normalizedPhone)) {
      setMpesaPromptError("Enter a valid Safaricom number (07xx... or 2547xx...).");
      return;
    }

    mpesaStkMutation.mutate(
      {
        amountMinor: pendingMpesaPayload.amountMinor,
        phoneNumber: normalizedPhone,
        accountReference: pendingMpesaPayload.groupId.slice(0, 12),
        transactionDesc: "JamiiFlow Deposit",
      },
      {
        onSuccess: (stk) => {
          submitPayment({
            ...pendingMpesaPayload,
            notes: pendingMpesaPayload.notes
              ? `${pendingMpesaPayload.notes} | M-Pesa STK: ${normalizedPhone}`
              : `M-Pesa STK: ${normalizedPhone}`,
            referenceCode: stk.checkoutRequestId || pendingMpesaPayload.referenceCode || `MPESA-${Date.now()}`,
          });
          setPendingMpesaPayload(null);
          setMpesaPromptError(null);
        },
        onError: () => {
          setMpesaPromptError(
            "M-Pesa STK push failed. Confirm credentials/config and try again.",
          );
        },
      },
    );
  };

  return (
    <section>
      <h1 className="page-title">Payments</h1>
      <article className="card form-card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Record Payment</h2>
        <form
          className="form-grid"
          onSubmit={handleSubmit(handlePaymentSubmit)}
        >
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
            Payer User ID
            <input {...register("payerUserId")} placeholder="usr_demo_admin" />
          </label>
          <label>
            Payment Method
            <select {...register("paymentMethod")}>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>
            Amount (minor units)
            <input type="number" {...register("amountMinor", { valueAsNumber: true })} />
          </label>
          <label>
            Currency
            <input {...register("currency")} />
          </label>
          <label>
            Payment Date
            <input type="date" {...register("paymentDate")} />
          </label>
          <label>
            Reference Code
            <input {...register("referenceCode")} />
          </label>
          <label>
            Notes
            <input {...register("notes")} />
          </label>
          <button className="button-primary" type="submit" disabled={createPaymentMutation.isPending}>
            {createPaymentMutation.isPending ? "Saving..." : "Submit Deposit"}
          </button>
        </form>
      </article>

      <article className="card">
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Payment History</h2>
        <DataTable
          rows={paymentsQuery.data?.payments ?? []}
          columns={[
            { key: "date", header: "Date", render: (row) => row.payment_date },
            { key: "payer", header: "Payer", render: (row) => row.payer_user_id },
            { key: "method", header: "Method", render: (row) => row.payment_method },
            { key: "amount", header: "Amount", render: (row) => `${row.amount_minor} ${row.currency}` },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusBadge label={row.status} tone={row.status === "POSTED" ? "success" : "warning"} />
              ),
            },
          ]}
        />
      </article>

      {pendingMpesaPayload ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>M-Pesa STK Push Confirmation</h2>
            <p style={{ color: "var(--color-muted)" }}>
              You are initiating a deposit of <strong>{pendingMpesaPayload.amountMinor} {pendingMpesaPayload.currency}</strong>.
              Enter the phone number to prompt.
            </p>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              M-Pesa Phone Number
              <input value={mpesaPhone} onChange={(event) => setMpesaPhone(event.target.value)} />
            </label>
            {mpesaPromptError ? <p className="text-danger">{mpesaPromptError}</p> : null}
            <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
              <button
                type="button"
                className="button-primary"
                onClick={confirmMpesaPrompt}
                disabled={createPaymentMutation.isPending || mpesaStkMutation.isPending}
              >
                {mpesaStkMutation.isPending || createPaymentMutation.isPending
                  ? "Processing..."
                  : "Send STK Prompt"}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setPendingMpesaPayload(null);
                  setMpesaPromptError(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
