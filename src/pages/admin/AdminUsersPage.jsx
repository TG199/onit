import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/client";
import { Card, Button, EmptyState, StatusBadge, Table } from "../../components/ui";
import toast from "react-hot-toast";

function fmt(n) {
  return typeof n === "number"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "₦0.00";
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toggling, setToggling] = useState(null);
  const [page, setPage] = useState(0);
  const LIMIT = 50;

  // Simple debounce on search
  function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window.__userSearchTimer);
    window.__userSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(0);
    }, 350);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { debouncedSearch, page }],
    queryFn: () =>
      adminApi.getUsers({
        limit: LIMIT,
        offset: page * LIMIT,
        search: debouncedSearch || undefined,
      }).then((r) => r.data),
    staleTime: 20_000,
  });

  async function handleToggleBlock(user) {
    setToggling(user.id);
    try {
      if (user.isBlocked) {
        await adminApi.unblockUser(user.id);
        toast.success(`${user.email} unblocked`);
      } else {
        await adminApi.blockUser(user.id);
        toast.success(`${user.email} blocked`);
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not update user");
    } finally {
      setToggling(null);
    }
  }

  const users = data?.users || [];

  const columns = [
    {
      key: "email", label: "User", render: (v, row) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.phone}</div>
        </div>
      ),
    },
    {
      key: "role", label: "Role", render: (v) => (
        <span style={{
          fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
          color: v === "admin" ? "var(--gold)" : "var(--text-secondary)",
        }}>
          {v}
        </span>
      ),
    },
    {
      key: "balance", label: "Balance",
      render: (v) => <span style={{ color: "var(--gold)", fontWeight: 600 }}>{fmt(v)}</span>,
    },
    {
      key: "isBlocked", label: "Status",
      render: (v) => <StatusBadge status={v ? "blocked" : "active"} />,
    },
    { key: "location", label: "Location", render: (v) => v || "—" },
    { key: "createdAt", label: "Joined", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    {
      key: "id", label: "Actions", render: (id, row) => (
        <Button
          size="sm"
          variant={row.isBlocked ? "success" : "danger"}
          loading={toggling === id}
          onClick={() => handleToggleBlock(row)}
        >
          {row.isBlocked ? "Unblock" : "Block"}
        </Button>
      ),
    },
  ];

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Manage Users</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          View all users and block or unblock their accounts
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 340 }}>
        <input
          type="text"
          placeholder="Search by email or phone..."
          value={search}
          onChange={handleSearch}
          style={{
            width: "100%", padding: "9px 14px", fontSize: "13px",
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", color: "var(--text)", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={users}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon="◯"
              title="No users found"
              description={debouncedSearch ? "No users match your search." : "No users have registered yet."}
            />
          }
        />
      </Card>

      {(users.length === LIMIT || page > 0) && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {page > 0 && (
            <button onClick={() => setPage((p) => p - 1)}
              style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>
              ← Prev
            </button>
          )}
          {users.length === LIMIT && (
            <button onClick={() => setPage((p) => p + 1)}
              style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", color: "var(--text)", cursor: "pointer" }}>
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
