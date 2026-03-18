import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/client";
import {
  Card, Button, Modal, Input, StatusBadge,
  EmptyState, ErrorMsg, Table
} from "../../components/ui";
import toast from "react-hot-toast";

function fmt(n) {
  return typeof n === "number"
    ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "₦0.00";
}

const EMPTY_AD = {
  title: "", advertiser: "", targetUrl: "",
  imageUrl: "", payoutPerView: "", maxViews: "", description: "",
};

export default function AdminAdsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState(EMPTY_AD);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [toggling, setToggling] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ads", statusFilter],
    queryFn: () => adminApi.getAds({
      limit: 50,
      status: statusFilter === "all" ? undefined : statusFilter || undefined,
    }).then((r) => r.data),
    staleTime: 20_000,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin-ads"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleCreate() {
    setFormError(null);
    if (!form.title || !form.advertiser || !form.targetUrl || !form.payoutPerView) {
      setFormError({ message: "Title, advertiser, target URL, and payout are required" });
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createAd({ ...form, payoutPerView: parseFloat(form.payoutPerView), maxViews: form.maxViews ? parseInt(form.maxViews) : undefined });
      toast.success("Ad created (starts paused)");
      invalidate();
      setCreateModal(false);
      setForm(EMPTY_AD);
    } catch (err) {
      setFormError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError(null);
    setSubmitting(true);
    try {
      await adminApi.updateAd(editModal.id, {
        ...form,
        payoutPerView: parseFloat(form.payoutPerView),
        maxViews: form.maxViews ? parseInt(form.maxViews) : undefined,
      });
      toast.success("Ad updated");
      invalidate();
      setEditModal(null);
    } catch (err) {
      setFormError(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(ad) {
    setToggling(ad.id);
    try {
      if (ad.status === "active") {
        await adminApi.pauseAd(ad.id);
        toast.success("Ad paused");
      } else {
        await adminApi.activateAd(ad.id);
        toast.success("Ad activated");
      }
      invalidate();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not update ad status");
    } finally {
      setToggling(null);
    }
  }

  function openEdit(ad) {
    setEditModal(ad);
    setForm({
      title: ad.title || "",
      advertiser: ad.advertiser || "",
      targetUrl: ad.targetUrl || "",
      imageUrl: ad.imageUrl || "",
      payoutPerView: ad.payoutPerView?.toString() || "",
      maxViews: ad.maxViews?.toString() || "",
      description: ad.description || "",
    });
    setFormError(null);
  }

  const ads = data?.ads || [];

  const columns = [
    {
      key: "title", label: "Ad", render: (v, row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: "13px" }}>{v}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.advertiser}</div>
        </div>
      )
    },
    { key: "payoutPerView", label: "Payout/view", render: (v) => <span style={{ color: "var(--gold)", fontWeight: 600 }}>{fmt(v)}</span> },
    { key: "totalViews", label: "Views", render: (v, row) => `${v ?? 0}${row.maxViews ? ` / ${row.maxViews}` : ""}` },
    { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "createdAt", label: "Created", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    {
      key: "id", label: "Actions", render: (id, row) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>Edit</Button>
          <Button
            size="sm"
            variant={row.status === "active" ? "danger" : "success"}
            loading={toggling === id}
            onClick={() => handleToggle(row)}
          >
            {row.status === "active" ? "Pause" : "Activate"}
          </Button>
        </div>
      )
    },
  ];

  const AdForm = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <ErrorMsg error={formError} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Input label="Title *" placeholder="Download App X" value={form.title} onChange={set("title")} />
        <Input label="Advertiser *" placeholder="Company Name" value={form.advertiser} onChange={set("advertiser")} />
      </div>
      <Input label="Target URL *" type="url" placeholder="https://example.com" value={form.targetUrl} onChange={set("targetUrl")} />
      <Input label="Image URL" type="url" placeholder="https://..." value={form.imageUrl} onChange={set("imageUrl")} hint="Optional banner image" />
      <Input label="Description" placeholder="Short description of the task" value={form.description} onChange={set("description")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Input label="Payout per view (₦) *" type="number" min="0.01" step="0.01" placeholder="10.00" value={form.payoutPerView} onChange={set("payoutPerView")} />
        <Input label="Max views" type="number" min="1" placeholder="Unlimited" value={form.maxViews} onChange={set("maxViews")} hint="Leave blank for unlimited" />
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Manage Ads</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            Create, edit, activate and pause advertising campaigns
          </p>
        </div>
        <Button onClick={() => { setCreateModal(true); setForm(EMPTY_AD); setFormError(null); }}>
          + Create ad
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Paused", value: "paused" }, { label: "Expired", value: "expired" }].map(({ label, value }) => (
          <button key={value} onClick={() => setStatusFilter(value === "all" ? null : value)}
            style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              border: `1px solid ${statusFilter === (value === "all" ? null : value) ? "var(--gold)" : "var(--border)"}`,
              background: statusFilter === (value === "all" ? null : value) ? "var(--gold-muted)" : "transparent",
              color: statusFilter === (value === "all" ? null : value) ? "var(--gold)" : "var(--text-secondary)",
              cursor: "pointer", transition: "all var(--transition)",
            }}>
            {label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Table columns={columns} data={ads} loading={isLoading}
          emptyState={<EmptyState icon="◈" title="No ads yet" description='Click "Create ad" to add the first campaign.' />}
        />
      </Card>

      {/* Create modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create new ad" width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AdForm />
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button loading={submitting} onClick={handleCreate}>Create ad</Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editModal)} onClose={() => setEditModal(null)} title={`Edit — ${editModal?.title}`} width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AdForm />
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button loading={submitting} onClick={handleUpdate}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}