import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/client";
import { StatCard, Card, PageSpinner, EmptyState, StatusBadge } from "../../components/ui";

function fmt(n) {
  return typeof n === "number" ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₦0.00";
}

const TX_TYPES = [
  { label: "All", value: null },
  { label: "Ad payouts", value: "ad_payout" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Refunds", value: "refund" },
  { label: "Bonuses", value: "bonus" },
];

const TX_ICONS = {
  ad_payout: { icon: "◈", color: "var(--success)" },
  withdrawal: { icon: "↗", color: "var(--danger)" },
  refund: { icon: "↩", color: "var(--info)" },
  bonus: { icon: "★", color: "var(--gold)" },
  adjustment: { icon: "≈", color: "var(--warning)" },
};

export default function WalletPage() {
  const [txType, setTxType] = useState(null);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => userApi.getWallet().then((r) => r.data),
    staleTime: 20_000,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", { txType, page }],
    queryFn: () => userApi.getTransactions({ limit: LIMIT, offset: page * LIMIT, type: txType }).then((r) => r.data),
    staleTime: 15_000,
  });

  if (walletLoading) return <PageSpinner />;

  const w = walletData || {};
  const txs = txData?.transactions || [];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Wallet</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Your balance and full transaction history
        </p>
      </div>

      {/* Balance card */}
      <Card gold style={{ padding: "28px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          Available balance
        </div>
        <div style={{ fontSize: "48px", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {fmt(w.balance)}
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
        <StatCard label="Total earned" value={fmt(w.stats?.totalEarned)} icon="↑" accent="var(--success)" />
        <StatCard label="Total withdrawn" value={fmt(w.stats?.totalWithdrawn)} icon="↗" />
        <StatCard label="Transactions" value={w.stats?.totalTransactions ?? 0} icon="≡" />
      </div>

      {/* Transactions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ fontSize: "16px", fontFamily: "var(--font-display)" }}>Transaction history</h2>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {TX_TYPES.map(({ label, value }) => (
              <button key={label} onClick={() => { setTxType(value); setPage(0); }}
                style={{
                  padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
                  border: `1px solid ${txType === value ? "var(--gold)" : "var(--border)"}`,
                  background: txType === value ? "var(--gold-muted)" : "transparent",
                  color: txType === value ? "var(--gold)" : "var(--text-secondary)",
                  cursor: "pointer", transition: "all var(--transition)",
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {txLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div className="skeleton" style={{ height: 14, width: "40%" }} />
                  <div className="skeleton" style={{ height: 12, width: "25%" }} />
                </div>
                <div className="skeleton" style={{ height: 18, width: 80 }} />
              </div>
            ))
          ) : txs.length === 0 ? (
            <EmptyState icon="◇" title="No transactions yet" description="Approved submissions will appear here as credits." />
          ) : (
            txs.map((tx, i) => {
              const meta = TX_ICONS[tx.type] || { icon: "·", color: "var(--text-secondary)" };
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 18px",
                  borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "var(--bg-elevated)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "16px", color: meta.color,
                  }}>{meta.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, textTransform: "capitalize" }}>
                      {tx.type.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {new Date(tx.createdAt).toLocaleString()} · Balance after: {fmt(tx.balanceAfter)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)",
                    color: isCredit ? "var(--success)" : "var(--danger)",
                  }}>
                    {isCredit ? "+" : ""}{fmt(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </Card>

        {(txs.length === LIMIT || page > 0) && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "14px" }}>
            {page > 0 && <button onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>← Prev</button>}
            {txs.length === LIMIT && <button onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>Next →</button>}
          </div>
        )}
      </div>
    </div>
  );
}