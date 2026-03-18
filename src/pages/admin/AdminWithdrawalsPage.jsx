import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/client";
import {
  Card, Button, Modal, Input, Textarea,
  PageSpinner, EmptyState, StatusBadge, ErrorMsg, Table
} from "../../components/ui";
import toast from "react-hot-toast";

function fmt(n) {
  return typeof n === "number"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "₦0.00";
}

const STATUS_FILTERS = [
  { label: "Pending", value: null },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "All", value: "all" },
];

export default function AdminWithdrawalsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);
  const [processing, setProcessing] = useState(null);

  // Complete modal
  const [completeModal, setCompleteModal] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [completeError, setCompleteError] = useState(null);

  // Fail modal
  const [failModal, setFailModal] = useState(null);
  const [failReason, setFailReason] = useState("");
  const [failError, setFailError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals", statusFilter],
    queryFn: () => adminApi.getWithdrawals({
      limit: 50,
      status: statusFilter === "all" ? undefined : statusFilter || undefined,
    }).then((r) => r.data),
    staleTime: 15_000,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  async function handleProcess(id) {
    setProcessing(id);
    try {
      await adminApi.processWithdrawal(id);
      toast.success("Withdrawal processed — balance deducted");
      invalidate();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not process");
    } finally {
      setProcessing(null);
    }
  }

  async function handleComplete() {
    if (!txHash.trim()) { setCompleteError({ message: "Transaction hash is required" }); return; }
    setCompleteError(null);
    setProcessing(completeModal.id);
    try {
      await adminApi.completeWithdrawal(completeModal.id, txHash.trim());
      toast.success("Withdrawal marked as completed");
      invalidate();
      setCompleteModal(null);
      setTxHash("");
    } catch (err) {
      setCompleteError(err);
    } finally {
      setProcessing(null);
    }
  }

  async function handleFail() {
    if (failReason.trim().length < 10) { setFailError({ message: "Reason must be at least 10 characters" }); return; }
    setFailError(null);
    setProcessing(failModal.id);
    try {
      await adminApi.failWithdrawal(failModal.id, failReason.trim());
      toast.success("Withdrawal failed — user refunded");
      invalidate();
      setFailModal(null);
      setFailReason("");
    } catch (err) {
      setFailError(err);
    } finally {
      setProcessing(null);
    }
  }

  const withdrawals = data?.withdrawals || [];

  const columns = [
    {
      key: "userEmail", label: "User", render: (v, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Balance: {fmt(row.userBalance)}</div>
        </div>
      )
    },
    {
      key: "amount", label: "Amount",
      render: (v) => <span style={{ color: "var(--gold)", fontWeight: 600, fontSize: "14px" }}>{fmt(v)}</span>
    },
    {
      key: "method", label: "Method",
      render: (v, row) => (
        <div>
          <div style={{ fontSize: "12px", textTransform: "capitalize" }}>{v?.replace(/_/g, " ")}</div>
          {row.paymentDetails && (
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {typeof row.paymentDetails === "object"
                ? Object.values(row.paymentDetails).filter(Boolean).join(" · ")
                : ""}
            </div>
          )}
        </div>
      )
    },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "createdAt", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    {
      key: "id", label: "Actions", render: (id, row) => {
        if (row.status === "completed" || row.status === "failed" || row.status === "cancelled") {
          return <StatusBadge status={row.status} />;
        }
        if (row.status === "pending") return (
          <Button variant="success" size="sm" loading={processing === id} onClick={() => handleProcess(id)}>
            Process
          </Button>
        );
        if (row.status === "processing") return (
          <div style={{ display: "flex", gap: "6px" }}>
            <Button size="sm" loading={processing === id}
              onClick={() => { setCompleteModal(row); setTxHash(""); setCompleteError(null); }}>
              Complete
            </Button>
            <Button variant="danger" size="sm" disabled={Boolean(processing)}
              onClick={() => { setFailModal(row); setFailReason(""); setFailError(null); }}>
              Fail
            </Button>
          </div>
        );
        return null;
      }
    },
  ];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Withdrawal Queue</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Process → Complete → or Fail (with refund)
        </p>
      </div>

      {/* Workflow hint */}
      <div style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "14px 18px",
        display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap",
        fontSize: "12px", color: "var(--text-secondary)",
      }}>
        <span style={{ color: "var(--warning)", fontWeight: 600 }}>Pending</span>
        <span>→ click Process (deducts balance) →</span>
        <span style={{ color: "var(--info)", fontWeight: 600 }}>Processing</span>
        <span>→ send payment externally →</span>
        <span style={{ color: "var(--success)", fontWeight: 600 }}>Complete</span>
        <span>or</span>
        <span style={{ color: "var(--danger)", fontWeight: 600 }}>Fail</span>
        <span>(auto-refunds user)</span>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(({ label, value }) => (
          <button key={label} onClick={() => setStatusFilter(value)}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              border: `1px solid ${statusFilter === value ? "var(--gold)" : "var(--border)"}`,
              background: statusFilter === value ? "var(--gold-muted)" : "transparent",
              color: statusFilter === value ? "var(--gold)" : "var(--text-secondary)",
              cursor: "pointer", transition: "all var(--transition)",
            }}>
            {label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={withdrawals}
          loading={isLoading}
          emptyState={<EmptyState icon="↗" title="No withdrawals" description="No withdrawals match the current filter." />}
        />
      </Card>

      {/* Complete modal */}
      <Modal
        open={Boolean(completeModal)}
        onClose={() => { setCompleteModal(null); setTxHash(""); }}
        title="Complete withdrawal"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: "12px 14px", fontSize: "13px" }}>
            User: <strong>{completeModal?.userEmail}</strong> ·
            Amount: <strong style={{ color: "var(--gold)" }}>{fmt(completeModal?.amount)}</strong>
          </div>
          <ErrorMsg error={completeError} />
          <Input label="Transaction hash / reference" placeholder="TXN123456789"
            value={txHash} onChange={(e) => setTxHash(e.target.value)}
            hint="The external payment reference from your bank or payment provider" />
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button loading={Boolean(processing)} onClick={handleComplete}>Mark completed</Button>
          </div>
        </div>
      </Modal>

      {/* Fail modal */}
      <Modal
        open={Boolean(failModal)}
        onClose={() => { setFailModal(null); setFailReason(""); }}
        title="Fail withdrawal (user will be refunded)"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "var(--danger-bg)", border: "1px solid rgba(231,76,60,0.2)",
            borderRadius: "var(--radius)", padding: "12px 14px", fontSize: "13px", color: "var(--danger)",
          }}>
            The user's balance will be refunded automatically.
          </div>
          <ErrorMsg error={failError} />
          <Textarea label="Failure reason (min. 10 characters)"
            placeholder="Bank account details invalid..."
            value={failReason} onChange={(e) => setFailReason(e.target.value)}
            style={{ minHeight: "90px" }} />
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setFailModal(null)}>Cancel</Button>
            <Button variant="danger" loading={Boolean(processing)} onClick={handleFail}>Confirm failure</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}