import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";

const userNav = [
  { to: "/dashboard", icon: "⬡", label: "Dashboard" },
  { to: "/ads", icon: "◈", label: "Ads Market" },
  { to: "/submissions", icon: "◎", label: "My Submissions" },
  { to: "/wallet", icon: "◇", label: "Wallet" },
  { to: "/withdrawals", icon: "↗", label: "Withdrawals" },
];

const adminNav = [
  { to: "/admin", icon: "⬡", label: "Overview" },
  { to: "/admin/submissions", icon: "◎", label: "Submissions" },
  { to: "/admin/withdrawals", icon: "↗", label: "Withdrawals" },
  { to: "/admin/ads", icon: "◈", label: "Manage Ads" },
  { to: "/admin/users", icon: "◯", label: "Users" },
  { to: "/admin/logs", icon: "≡", label: "Audit Logs" },
];

export default function AppLayout({ children }) {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = isAdmin ? adminNav : userNav;

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  }

  const sidebarWidth = 220;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth, flexShrink: 0, position: "fixed",
        top: 0, left: mobileOpen ? 0 : undefined, bottom: 0,
        background: "var(--bg-card)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        zIndex: 100, transition: "transform var(--transition)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--gold)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "16px", color: "#000", flexShrink: 0,
            }}>O</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>
                ONIT
              </div>
              {isAdmin && (
                <div style={{ fontSize: "10px", color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Admin
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflow: "auto" }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "var(--radius)",
                marginBottom: "2px", fontSize: "13px", fontWeight: 500,
                color: isActive ? "var(--gold)" : "var(--text-secondary)",
                background: isActive ? "var(--gold-muted)" : "transparent",
                transition: "all var(--transition)", textDecoration: "none",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.background = "var(--bg-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.dataset.active) {
                  e.currentTarget.style.color = "";
                  e.currentTarget.style.background = "";
                }
              }}
            >
              <span style={{ fontSize: "16px", width: 20, textAlign: "center" }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "var(--radius)",
              width: "100%", fontSize: "13px", fontWeight: 500,
              color: "var(--text-secondary)", background: "none",
              transition: "all var(--transition)", textAlign: "left",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-bg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
          >
            <span style={{ fontSize: "16px", width: 20, textAlign: "center" }}>⇥</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: sidebarWidth, minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}