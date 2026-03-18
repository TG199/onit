import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/client";
import { Card, PageSpinner, EmptyState, StatusBadge, Table } from "../../components/ui";

function fmt(n) {
  return typeof n === "number" ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}` : "—";
}

const STATUS_FILTERS = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Under review", value: "under_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function SubmissionsPage() {
  const [status, setStatus] = useState(null);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["submissions", { status, page }],
    queryFn: () => userApi.getSubmissions({ limit: LIMIT, offset: page * LIMIT, status }).then((r) => r.data),
    staleTime: 20_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["submission-stats"],
    queryFn: () => userApi.getSubmissionStats().then((r) => r.data),
    staleTime: 30_000,
  });

  const stats = statsData?.stats || {};

  const columns = [
    { key: "ad", label: "Ad", render: (_, row) => (
      <div>
        <div style={{ fontWeight: 500, fontSize: "13px" }}>{row.ad?.title || "—"}</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.ad?.advertiser || ""}</div>
      </div>
    )},
    { key: "ad.payoutPerView", label: "Payout", render: (_, row) => (
      <span style={{ color: "var(--gold)", fontWeight: 600 }}>{fmt(row.ad?.payoutPerView)}</span>
    )},
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "createdAt", label: "Submitted", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    { key: "rejectionReason", label: "Rejection reason", render: (v) => (
      <span style={{ fontSize: "12px", color: "var(--danger)" }}>{v || "—"}</span>
    )},
  ];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>My Submissions</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Track all your ad proof submissions
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
        {[
          { label: "Total", value: stats.totalSubmissions, color: "var(--text)" },
          { label: "Pending", value: stats.pending, color: "var(--warning)" },
          { label: "Approved", value: stats.approved, color: "var(--success)" },
          { label: "Rejected", value: stats.rejected, color: "var(--danger)" },
          { label: "Approval rate", value: stats.approvalRate ? `${stats.approvalRate}%` : "0%", color: "var(--gold)" },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: "14px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "var(--font-display)", color }}>{value ?? 0}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(({ label, value }) => (
          <button key={label} onClick={() => { setStatus(value); setPage(0); }}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              border: `1px solid ${status === value ? "var(--gold)" : "var(--border)"}`,
              background: status === value ? "var(--gold-muted)" : "transparent",
              color: status === value ? "var(--gold)" : "var(--text-secondary)",
              cursor: "pointer", transition: "all var(--transition)",
            }}>
            {label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={data?.submissions || []}
          loading={isLoading}
          emptyState={<EmptyState icon="◎" title="No submissions yet" description="Browse ads and submit proofs to see them here." />}
        />
      </Card>

      {/* Pagination */}
      {((data?.submissions?.length === LIMIT) || page > 0) && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {page > 0 && <button onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>← Prev</button>}
          {data?.submissions?.length === LIMIT && <button onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>Next →</button>}
        </div>
      )}
    </div>
  );
}