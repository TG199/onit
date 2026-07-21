import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/client";
import { Button, Card, Modal, Input, PageSpinner, EmptyState, ErrorMsg, StatusBadge } from "../../components/ui";
import toast from "react-hot-toast";

function fmt(n) {
  return typeof n === "number" ? `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}` : "₦0.00";
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // CORS or network issue — fall back to opening the image in a new tab
    // so the user can save it manually.
    window.open(url, "_blank", "noopener,noreferrer");
    toast.error("Couldn't auto-download — opened the image in a new tab instead.");
  }
}

function AdCard({ ad, onSubmit }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(e) {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    const safeName = (ad.title || "ad-image").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    await downloadImage(ad.imageUrl, `${safeName}.jpg`);
    setDownloading(false);
  }

  return (
    <Card hover style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "18px" }}>
      {/* Ad image */}
      {ad.imageUrl && (
        <div style={{
          position: "relative",
          height: 140, borderRadius: "var(--radius)", overflow: "hidden",
          background: "var(--bg-elevated)",
        }}>
          <img src={ad.imageUrl} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download image"
            aria-label="Download image"
            style={{
              position: "absolute", top: 8, right: 8,
              width: 30, height: 30, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0, 0, 0, 0.55)", border: "none", cursor: downloading ? "default" : "pointer",
              color: "#fff", opacity: downloading ? 0.6 : 1,
              backdropFilter: "blur(2px)",
            }}
          >
            {downloading ? (
              <span style={{ fontSize: "11px" }}>…</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            )}
          </button>
        </div>
      )}
      {!ad.imageUrl && (
        <div style={{
          height: 100, borderRadius: "var(--radius)", background: "var(--bg-elevated)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px", color: "var(--text-muted)",
        }}>◈</div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{ad.title}</div>
        {ad.description && (
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "8px" }}>
            {ad.description}
          </div>
        )}
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ad.advertiser}</div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: "12px", borderTop: "1px solid var(--border)",
      }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-display)" }}>
            {fmt(ad.payoutPerView)}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            {ad.maxViews ? `${ad.totalViews}/${ad.maxViews} views` : `${ad.totalViews} views`}
          </div>
        </div>

        {ad.hasSubmitted ? (
          <StatusBadge status="pending" />
        ) : (
          <Button size="sm" onClick={() => onSubmit(ad)}>
            Submit proof
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function AdsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [submitAd, setSubmitAd] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const LIMIT = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["ads", page],
    queryFn: () => userApi.getAds({ limit: LIMIT, offset: page * LIMIT }).then((r) => r.data),
    staleTime: 30_000,
  });

  async function handleSubmit() {
    if (!proofUrl.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await userApi.submitProof(submitAd.id, proofUrl.trim());
      toast.success("Proof submitted! Awaiting admin review.");
      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setSubmitAd(null);
      setProofUrl("");
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const ads = data?.ads || [];
  const hasMore = ads.length === LIMIT;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "26px", letterSpacing: "-0.02em" }}>Ads Market</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Browse active ads, download and share them, then submit your proof to earn.
        </p>
      </div>

      {/* How it works */}
      <div style={{
        background: "var(--gold-muted)", border: "1px solid var(--gold-border)",
        borderRadius: "var(--radius-lg)", padding: "14px 18px",
        display: "flex", gap: "24px", flexWrap: "wrap",
      }}>
        {["1. Browse an ad below", "2. Share it on your socials", "3. Screenshot your post", "4. Upload screenshot → get link → submit"].map((step) => (
          <div key={step} style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>{step.split(".")[0]}.</span>
            {step.split(".").slice(1).join(".")}
          </div>
        ))}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : ads.length === 0 ? (
        <EmptyState icon="◈" title="No active ads" description="Check back soon — new ads are added regularly." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} onSubmit={setSubmitAd} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasMore || page > 0) && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          {page > 0 && <Button variant="secondary" onClick={() => setPage(p => p - 1)}>← Previous</Button>}
          {hasMore && <Button variant="secondary" onClick={() => setPage(p => p + 1)}>Next →</Button>}
        </div>
      )}

      {/* Submit proof modal */}
      <Modal
        open={Boolean(submitAd)}
        onClose={() => { setSubmitAd(null); setProofUrl(""); setSubmitError(null); }}
        title={`Submit proof — ${submitAd?.title}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "var(--bg-elevated)", borderRadius: "var(--radius)",
            padding: "12px 14px", fontSize: "13px", color: "var(--text-secondary)",
          }}>
            Payout: <strong style={{ color: "var(--gold)" }}>{fmt(submitAd?.payoutPerView)}</strong> upon approval
          </div>

          <ErrorMsg error={submitError} />

          <Input
            label="Screenshot URL"
            type="url"
            placeholder="https://i.imgur.com/your-screenshot.jpg"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            hint="Upload your screenshot to Imgur, Cloudinary, or similar and paste the direct image URL here."
          />

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => { setSubmitAd(null); setProofUrl(""); }}>
              Cancel
            </Button>
            <Button loading={submitting} onClick={handleSubmit} disabled={!proofUrl.trim()}>
              Submit proof
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
