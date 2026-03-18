import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { StatCard, Card, PageSpinner, Button } from "../../components/ui";

function fmt(n) {
  return typeof n === "number"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₦0.00";
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats().then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: mismatchData } = useQuery({
    queryKey: ["admin-mismatches"],
    queryFn: () => adminApi.getMismatches().then((r) => r.data),
    staleTime: 60_000,
  });

  if (isLoading) return <PageSpinner />;

  const d = data || {};
  const mismatches = mismatchData?.count || 0;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Platform Overview</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Live statistics across the ONIT platform
        </p>
      </div>

      {/* Critical alert */}
      {mismatches > 0 && (
        <div style={{
          background: "var(--danger-bg)", border: "1px solid rgba(231,76,60,0.3)",
          borderRadius: "var(--radius-lg)", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--danger)", fontSize: "14px" }}>
              ⚠ Balance mismatch detected
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "3px" }}>
              {mismatches} user{mismatches > 1 ? "s have" : " has"} a discrepancy between stored and ledger balance.
            </div>
          </div>
          <Link to="/admin/logs">
            <Button variant="danger" size="sm">Investigate</Button>
          </Link>
        </div>
      )}

      {/* Users */}
      <div>
        <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
          Users
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          <StatCard label="Total users" value={d.users?.total ?? 0} icon="◯" />
          <StatCard label="Blocked" value={d.users?.blocked ?? 0} accent="var(--danger)" icon="✕" />
          <StatCard label="Total balance held" value={fmt(d.users?.totalBalance)} accent="var(--gold)" icon="◇" />
        </div>
      </div>

      {/* Submissions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Submissions
          </h2>
          <Link to="/admin/submissions">
            <Button variant="ghost" size="sm">Review queue →</Button>
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          <StatCard label="Total" value={d.submissions?.total ?? 0} icon="◎" />
          <StatCard label="Pending" value={d.submissions?.pending ?? 0} accent="var(--warning)" icon="◌" />
          <StatCard label="Approved" value={d.submissions?.approved ?? 0} accent="var(--success)" icon="✓" />
          <StatCard label="Rejected" value={d.submissions?.rejected ?? 0} accent="var(--danger)" icon="✕" />
        </div>
      </div>

      {/* Withdrawals */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Withdrawals
          </h2>
          <Link to="/admin/withdrawals">
            <Button variant="ghost" size="sm">Process queue →</Button>
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          <StatCard label="Total" value={d.withdrawals?.total ?? 0} icon="↗" />
          <StatCard label="Pending" value={d.withdrawals?.pending ?? 0} accent="var(--warning)" icon="◌" />
          <StatCard label="Completed" value={d.withdrawals?.completed ?? 0} accent="var(--success)" icon="✓" />
          <StatCard label="Total paid out" value={fmt(d.withdrawals?.totalPaid)} accent="var(--gold)" icon="◇" />
        </div>
      </div>

      {/* Ads */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ads
          </h2>
          <Link to="/admin/ads">
            <Button variant="ghost" size="sm">Manage ads →</Button>
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          <StatCard label="Total ads" value={d.ads?.total ?? 0} icon="◈" />
          <StatCard label="Active" value={d.ads?.active ?? 0} accent="var(--success)" icon="●" />
          <StatCard label="Paused" value={d.ads?.paused ?? 0} accent="var(--warning)" icon="◌" />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
          Quick actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          {[
            { to: "/admin/submissions", label: "Review submissions", sub: `${d.submissions?.pending ?? 0} pending`, icon: "◎" },
            { to: "/admin/withdrawals", label: "Process withdrawals", sub: `${d.withdrawals?.pending ?? 0} pending`, icon: "↗" },
            { to: "/admin/ads", label: "Manage ads", sub: `${d.ads?.active ?? 0} active`, icon: "◈" },
            { to: "/admin/users", label: "Manage users", sub: `${d.users?.total ?? 0} total`, icon: "◯" },
          ].map(({ to, label, sub, icon }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <Card hover style={{ padding: "16px" }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{sub}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}