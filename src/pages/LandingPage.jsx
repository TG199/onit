import { Link } from "react-router-dom";

const steps = [
  { icon: "◈", title: "Browse ads", desc: "Pick active ads from our marketplace across Nigeria and beyond." },
  { icon: "↗", title: "Share on socials", desc: "Post the ad on WhatsApp, Instagram, Facebook, or TikTok." },
  { icon: "◎", title: "Submit proof", desc: "Screenshot your post and submit the image URL as proof." },
  { icon: "◇", title: "Get paid", desc: "Admin reviews and approves — your balance updates instantly." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 5%", background: "rgba(10,10,8,0.85)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: "#000",
          }}>O</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px" }}>ONIT</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link to="/login" style={{
            padding: "8px 18px", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", color: "var(--text)",
            fontSize: "13px", fontWeight: 500,
          }}>
            Sign in
          </Link>
          <Link to="/register" style={{
            padding: "8px 18px", borderRadius: "var(--radius)",
            background: "var(--gold)", color: "#000",
            fontSize: "13px", fontWeight: 600,
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "120px 20px 80px",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 70%)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 14px", borderRadius: "20px",
          background: "var(--gold-muted)", border: "1px solid var(--gold-border)",
          fontSize: "12px", fontWeight: 500, color: "var(--gold)",
          marginBottom: "28px",
        }}>
          ● Now live across Nigeria
        </div>

        <h1 style={{
          fontSize: "clamp(38px, 7vw, 72px)", letterSpacing: "-0.04em",
          lineHeight: 1.05, maxWidth: 780, marginBottom: "24px",
        }}>
          Earn money sharing
          <br />
          <span style={{ color: "var(--gold)" }}>ads on social media</span>
        </h1>

        <p style={{
          fontSize: "18px", color: "var(--text-secondary)", maxWidth: 520,
          lineHeight: 1.6, marginBottom: "40px",
        }}>
          Browse ads, post them to your socials, submit proof, and get paid.
          No stress. No hidden fees. Just real earnings.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/register" style={{
            padding: "14px 32px", borderRadius: "var(--radius)",
            background: "var(--gold)", color: "#000",
            fontSize: "15px", fontWeight: 700,
          }}>
            Start earning now
          </Link>
          <Link to="/login" style={{
            padding: "14px 32px", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", color: "var(--text)",
            fontSize: "15px", fontWeight: 500,
          }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "80px 5%", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.03em", marginBottom: "12px" }}>
            How ONIT works
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: 400, margin: "0 auto" }}>
            Four simple steps from sign-up to payout
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {steps.map(({ icon, title, desc }, i) => (
            <div key={title} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: "28px 22px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 20,
                fontSize: "52px", fontWeight: 800, color: "var(--border)",
                fontFamily: "var(--font-display)", lineHeight: 1, userSelect: "none",
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: "28px", marginBottom: "14px", color: "var(--gold)" }}>{icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>
                {title}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        margin: "0 5% 80px", borderRadius: "var(--radius-xl)",
        background: "var(--gold-muted)", border: "1px solid var(--gold-border)",
        padding: "60px 40px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", letterSpacing: "-0.03em", marginBottom: "12px" }}>
          Ready to start earning?
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "28px" }}>
          Join thousands of Nigerians already earning with ONIT
        </p>
        <Link to="/register" style={{
          display: "inline-block", padding: "14px 36px",
          background: "var(--gold)", color: "#000",
          borderRadius: "var(--radius)", fontSize: "15px", fontWeight: 700,
        }}>
          Create free account
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "24px 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
        fontSize: "13px", color: "var(--text-muted)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#000" }}>O</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>ONIT</span>
        </div>
        <span>© {new Date().getFullYear()} ONIT. All rights reserved.</span>
      </footer>
    </div>
  );
}