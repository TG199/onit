import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/client";
import {
  Card, Button, Modal, Textarea, PageSpinner,
  EmptyState, StatusBadge, ErrorMsg, Table
} from "../../components/ui";
import toast from "react-hot-toast";

function fmt(n) {
  return typeof n === "number"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "₦0.00";
}

const STATUS_FILTERS = [
  { label: "Pending", value: null },
  { label: "All", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function AdminSubmissionsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions", { statusFilter, page }],
    queryFn: () => adminApi.getSubmissions({
      limit: LIMIT,
      offset: page * LIMIT,
      status: statusFilter === "all" ? undefined : statusFilter || undefined,
    }).then((r) => r.data),
    staleTime: 15_000,
  });

  async function handleApprove(id) {
    setProcessing(id);
    try {
      await adminApi.approveSubmission(id);
      toast.success("Submission approved — user paid!");
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not approve");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 10) {
      setRejectError({ message: "Reason must be at least 10 characters" });
      return;
    }
    setRejectError(null);
    setProcessing(rejectModal.id);
    try {
      await adminApi.rejectSubmission(rejectModal.id, rejectReason);
      toast.success("Submission rejected");
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      setRejectError(err);
    } finally {
      setProcessing(null);
    }
  }

  const columns = [
    {
      key: "userEmail", label: "User", render: (v, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.userPhone}</div>
        </div>
      )
    },
    {
      key: "adTitle", label: "Ad", render: (v, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.advertiser}</div>
        </div>
      )
    },
    {
      key: "payoutAmount", label: "Payout",
      render: (v) => <span style={{ color: "var(--gold)", fontWeight: 600 }}>{fmt(v)}</span>
    },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    {
      key: "proofUrl", label: "Proof",
      render: (v) => v ? (
        <a href={v} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "12px", color: "var(--gold)" }}>
          View screenshot →
        </a>
      ) : "—"
    },
    { key: "createdAt", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    {
      key: "id", label: "Actions", render: (id, row) => {
        if (row.status === "approved" || row.status === "rejected") return <StatusBadge status={row.status} />;
        return (
          <div style={{ display: "flex", gap: "6px" }}>
            <Button
              variant="success" size="sm"
              loading={processing === id}
              onClick={() => handleApprove(id)}
            >
              Approve
            </Button>
            <Button
              variant="danger" size="sm"
              disabled={Boolean(processing)}
              onClick={() => { setRejectModal(row); setRejectReason(""); setRejectError(null); }}
            >
              Reject
            </Button>
          </div>
        );
      }
    },
  ];

  const submissions = data?.submissions || [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Submission Queue</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Review user proof submissions and approve or reject them
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => { setStatusFilter(value); setPage(0); }}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              border: `1px solid ${statusFilter === value ? "var(--gold)" : "var(--border)"}`,
              background: statusFilter === value ? "var(--gold-muted)" : "transparent",
              color: statusFilter === value ? "var(--gold)" : "var(--text-secondary)",
              cursor: "pointer", transition: "all var(--transition)",
            }}
          >
            {label}
          </button>
        ))}
        {submissions.length > 0 && (
          <span style={{
            padding: "6px 10px", borderRadius: "20px", fontSize: "11px",
            background: "var(--warning-bg)", color: "var(--warning)", fontWeight: 600,
          }}>
            {submissions.length} item{submissions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={submissions}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon="◎"
              title="Queue is clear"
              description="No submissions match the current filter."
            />
          }
        />
      </Card>

      {/* Pagination */}
      {(submissions.length === LIMIT || page > 0) && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {page > 0 && (
            <button onClick={() => setPage((p) => p - 1)}
              style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>
              ← Prev
            </button>
          )}
          {submissions.length === LIMIT && (
            <button onClick={() => setPage((p) => p + 1)}
              style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>
              Next →
            </button>
          )}
        </div>
      )}

      {/* Reject modal */}
      <Modal
        open={Boolean(rejectModal)}
        onClose={() => { setRejectModal(null); setRejectReason(""); setRejectError(null); }}
        title={`Reject submission — ${rejectModal?.userEmail}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "var(--bg-elevated)", borderRadius: "var(--radius)",
            padding: "12px 14px", fontSize: "13px", color: "var(--text-secondary)",
          }}>
            Ad: <strong style={{ color: "var(--text)" }}>{rejectModal?.adTitle}</strong> ·
            Payout: <strong style={{ color: "var(--gold)" }}>{fmt(rejectModal?.payoutAmount)}</strong>
          </div>

          {rejectModal?.proofUrl && (
            <a href={rejectModal.proofUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "13px", color: "var(--gold)" }}>
              View submitted proof →
            </a>
          )}

          <ErrorMsg error={rejectError} />

          <Textarea
            label="Rejection reason (min. 10 characters)"
            placeholder="Screenshot does not show the completed action..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{ minHeight: "100px" }}
          />

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" loading={Boolean(processing)} onClick={handleReject}>
              Confirm rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}