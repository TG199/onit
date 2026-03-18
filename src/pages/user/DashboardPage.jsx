import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { userApi } from "../../api/client";
import { StatCard, Card, Button, PageSpinner, StatusBadge } from "../../components/ui";

function fmt(n) {
  return typeof n === "number" ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => userApi.getDashboard().then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: submissionsData } = useQuery({
    queryKey: ["submissions", { limit: 5 }],
    queryFn: () => userApi.getSubmissions({ limit: 5 }).then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) return <PageSpinner />;

  const d = data || {};

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Your earnings and activity at a glance
        </p>
      </div>

      {/* Balance highlight */}
      <Card gold style={{ padding: "28px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Wallet balance
            </div>
            <div style={{ fontSize: "42px", fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--gold)", lineHeight: 1 }}>
              {fmt(d.balance)}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px" }}>
              Total earned: {fmt(d.earnings?.total)} · Withdrawn: {fmt(d.withdrawals?.totalAmount)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/wallet">
              <Button variant="secondary" size="sm">View wallet</Button>
            </Link>
            <Link to="/withdrawals">
              <Button size="sm">Withdraw</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
        <StatCard
          label="Total submissions"
          value={d.submissions?.total ?? 0}
          sub={`${d.submissions?.approvalRate ?? 0}% approval rate`}
          icon="◎"
        />
        <StatCard
          label="Approved"
          value={d.submissions?.approved ?? 0}
          sub={`${d.submissions?.pending ?? 0} pending`}
          accent="var(--success)"
          icon="✓"
        />
        <StatCard
          label="Withdrawals"
          value={d.withdrawals?.total ?? 0}
          sub={`${d.withdrawals?.pending ?? 0} pending`}
          icon="↗"
        />
        <StatCard
          label="Ad earnings"
          value={fmt(d.earnings?.fromAds)}
          sub="From approved submissions"
          accent="var(--gold)"
          icon="◈"
        />
      </div>

      {/* Recent submissions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontFamily: "var(--font-display)" }}>Recent submissions</h2>
          <Link to="/submissions" style={{ fontSize: "13px", color: "var(--gold)" }}>View all →</Link>
        </div>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {!submissionsData?.submissions?.length ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
              No submissions yet.{" "}
              <Link to="/ads" style={{ color: "var(--gold)" }}>Browse ads to get started →</Link>
            </div>
          ) : (
            submissionsData.submissions.map((sub, i) => (
              <div key={sub.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: i < submissionsData.submissions.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500 }}>{sub.ad?.title || "Ad"}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--gold)" }}>
                    {fmt(sub.ad?.payoutPerView)}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: "16px", fontFamily: "var(--font-display)", marginBottom: "14px" }}>
          Quick actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
          {[
            { to: "/ads", icon: "◈", label: "Browse ads", sub: "Find ads to promote" },
            { to: "/wallet", icon: "◇", label: "View wallet", sub: "Transactions & balance" },
            { to: "/withdrawals", icon: "↗", label: "Withdraw funds", sub: "Request a payout" },
            { to: "/submissions", icon: "◎", label: "Submissions", sub: "Track your proofs" },
          ].map(({ to, icon, label, sub }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <Card hover style={{ padding: "16px" }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{label}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{sub}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}