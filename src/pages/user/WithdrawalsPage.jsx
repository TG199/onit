import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/client";
import {
  Card, StatCard, Button, Modal, Input, Select, Textarea,
  PageSpinner, EmptyState, StatusBadge, ErrorMsg, Table
} from "../../components/ui";
import toast from "react-hot-toast";

function fmt(n) {
  return typeof n === "number"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "₦0.00";
}

const METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "crypto", label: "Crypto" },
  { value: "mobile_money", label: "Mobile Money" },
];

function PaymentDetailsFields({ method, details, onChange }) {
  const set = (k) => (e) => onChange({ ...details, [k]: e.target.value });
  if (method === "bank_transfer") return (
    <>
      <Input label="Bank name" placeholder="GTBank" value={details.bankName || ""} onChange={set("bankName")} required />
      <Input label="Account number" placeholder="0123456789" value={details.accountNumber || ""} onChange={set("accountNumber")} required />
      <Input label="Account name" placeholder="John Doe" value={details.accountName || ""} onChange={set("accountName")} required />
    </>
  );
  if (method === "paypal") return (
    <Input label="PayPal email" type="email" placeholder="you@example.com" value={details.email || ""} onChange={set("email")} required />
  );
  if (method === "crypto") return (
    <>
      <Input label="Wallet address" placeholder="0x..." value={details.walletAddress || ""} onChange={set("walletAddress")} required />
      <Input label="Network" placeholder="Ethereum, BSC, etc." value={details.network || ""} onChange={set("network")} required />
    </>
  );
  if (method === "mobile_money") return (
    <>
      <Input label="Phone number" placeholder="+234 800 000 0000" value={details.phoneNumber || ""} onChange={set("phoneNumber")} required />
      <Input label="Provider" placeholder="MTN, Airtel, etc." value={details.provider || ""} onChange={set("provider")} required />
    </>
  );
  return null;
}

export default function WithdrawalsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState("bank_transfer");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => userApi.getWallet().then((r) => r.data),
    staleTime: 20_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["withdrawal-stats"],
    queryFn: () => userApi.getWithdrawalStats().then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: withdrawalData, isLoading } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => userApi.getWithdrawals({ limit: 50 }).then((r) => r.data),
    staleTime: 20_000,
  });

  async function handleSubmit() {
    setSubmitError(null);
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      setSubmitError({ message: "Minimum withdrawal is ₦10" });
      return;
    }
    setSubmitting(true);
    try {
      await userApi.requestWithdrawal({ amount: numAmount, method, paymentDetails: details });
      toast.success("Withdrawal request submitted!");
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["withdrawal-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowModal(false);
      setAmount("");
      setDetails({});
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    setCancelling(id);
    try {
      await userApi.cancelWithdrawal(id);
      toast.success("Withdrawal cancelled");
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["withdrawal-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not cancel");
    } finally {
      setCancelling(null);
    }
  }

  const stats = statsData?.stats || {};
  const balance = walletData?.balance ?? 0;
  const withdrawals = withdrawalData?.withdrawals || [];

  const columns = [
    { key: "amount", label: "Amount", render: (v) => <span style={{ color: "var(--gold)", fontWeight: 600 }}>{fmt(v)}</span> },
    { key: "method", label: "Method", render: (v) => <span style={{ textTransform: "capitalize", fontSize: "12px" }}>{v?.replace(/_/g, " ")}</span> },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "transactionHash", label: "Tx hash", render: (v) => v ? <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-secondary)" }}>{v}</span> : "—" },
    { key: "createdAt", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    {
      key: "id", label: "Action", render: (id, row) =>
        row.status === "pending" ? (
          <Button
            variant="danger" size="sm"
            loading={cancelling === id}
            onClick={() => handleCancel(id)}
          >
            Cancel
          </Button>
        ) : null
    },
  ];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Withdrawals</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Request payouts and track their status
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Request withdrawal</Button>
      </div>

      {/* Balance + stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
        <StatCard label="Balance" value={fmt(balance)} accent="var(--gold)" icon="◇" />
        <StatCard label="Total withdrawn" value={fmt(stats.totalWithdrawn)} icon="↗" />
        <StatCard label="Completed" value={stats.completed ?? 0} accent="var(--success)" icon="✓" />
        <StatCard label="Pending" value={stats.pending ?? 0} accent="var(--warning)" icon="◌" />
      </div>

      {/* History table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "14px", fontFamily: "var(--font-display)" }}>Withdrawal history</h2>
        </div>
        <Table
          columns={columns}
          data={withdrawals}
          loading={isLoading}
          emptyState={<EmptyState icon="↗" title="No withdrawals yet" description="Request your first payout when your balance reaches ₦10." />}
        />
      </Card>

      {/* Request modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setSubmitError(null); }} title="Request withdrawal">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "var(--gold-muted)", border: "1px solid var(--gold-border)",
            borderRadius: "var(--radius)", padding: "10px 14px", fontSize: "13px",
          }}>
            Available balance: <strong style={{ color: "var(--gold)" }}>{fmt(balance)}</strong>
          </div>

          <ErrorMsg error={submitError} />

          <Input
            label="Amount (₦)"
            type="number"
            min="10"
            step="0.01"
            placeholder="50.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint="Minimum ₦10 · Maximum 3 withdrawals per week"
          />

          <Select
            label="Payment method"
            value={method}
            onChange={(e) => { setMethod(e.target.value); setDetails({}); }}
          >
            {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>

          <PaymentDetailsFields method={method} details={details} onChange={setDetails} />

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={submitting} onClick={handleSubmit}>Submit request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}