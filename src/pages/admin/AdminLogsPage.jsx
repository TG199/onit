import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/client";
import { Card, PageSpinner, EmptyState, Table } from "../../components/ui";

const ACTION_COLORS = {
  approve_submission: "var(--success)",
  reject_submission: "var(--danger)",
  process_withdrawal: "var(--info)",
  complete_withdrawal: "var(--success)",
  fail_withdrawal: "var(--danger)",
  create_ad: "var(--gold)",
  update_ad: "var(--gold)",
  activate_ad: "var(--success)",
  pause_ad: "var(--warning)",
  block_user: "var(--danger)",
  unblock_user: "var(--success)",
};

export default function AdminLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => adminApi.getLogs({ limit: 100 }).then((r) => r.data),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });

  const logs = data?.logs || [];

  const columns = [
    {
      key: "createdAt", label: "Time",
      render: (v) => (
        <div style={{ fontSize: "12px" }}>
          <div>{v ? new Date(v).toLocaleDateString() : "—"}</div>
          <div style={{ color: "var(--text-muted)" }}>{v ? new Date(v).toLocaleTimeString() : ""}</div>
        </div>
      )
    },
    {
      key: "adminEmail", label: "Admin",
      render: (v) => <span style={{ fontSize: "12px" }}>{v}</span>
    },
    {
      key: "action", label: "Action",
      render: (v) => (
        <span style={{
          fontSize: "11px", fontWeight: 600, fontFamily: "monospace",
          color: ACTION_COLORS[v] || "var(--text-secondary)",
          background: "var(--bg-elevated)", borderRadius: "4px",
          padding: "2px 6px",
        }}>
          {v}
        </span>
      )
    },
    {
      key: "resourceType", label: "Resource",
      render: (v, row) => (
        <div>
          <div style={{ fontSize: "12px", textTransform: "capitalize" }}>{v}</div>
          <div style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--text-muted)" }}>
            {row.resourceId?.slice(0, 8)}...
          </div>
        </div>
      )
    },
    {
      key: "details", label: "Details",
      render: (v) => v ? (
        <div style={{
          fontSize: "11px", color: "var(--text-secondary)", maxWidth: 220,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {Object.entries(v)
            .filter(([, val]) => val !== undefined && val !== null)
            .map(([k, val]) => `${k}: ${typeof val === "object" ? "..." : val}`)
            .join(" · ")}
        </div>
      ) : "—"
    },
  ];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Audit Logs</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Every admin action is recorded here — approval, rejections, withdrawals, user management
        </p>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={logs}
          loading={isLoading}
          emptyState={<EmptyState icon="≡" title="No logs yet" description="Admin actions will appear here." />}
        />
      </Card>
    </div>
  );
}