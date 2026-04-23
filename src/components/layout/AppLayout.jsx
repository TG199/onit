import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

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

const SIDEBAR_W = 220;
const MOBILE_BP = 768;

export default function AppLayout({ children }) {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BP);
  const navItems = isAdmin ? adminNav : userNav;

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BP;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  }

  function closeMenu() {
    if (isMobile) setMobileOpen(false);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_W,
        flexShrink: 0,
        position: "fixed",
        top: 0, bottom: 0,
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transition: "transform 0.25s ease",
        transform: isMobile && !mobileOpen
          ? `translateX(-${SIDEBAR_W}px)`
          : "translateX(0)",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
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
              onClick={closeMenu}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "var(--radius)",
                marginBottom: "2px", fontSize: "13px", fontWeight: 500,
                color: isActive ? "var(--gold)" : "var(--text-secondary)",
                background: isActive ? "var(--gold-muted)" : "transparent",
                transition: "all var(--transition)", textDecoration: "none",
              })}
            >
              <span style={{ fontSize: "16px", width: 20, textAlign: "center" }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "var(--radius)",
              width: "100%", fontSize: "13px", fontWeight: 500,
              color: "var(--text-secondary)", background: "none",
              transition: "all var(--transition)", textAlign: "left", cursor: "pointer",
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
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
            padding: "0 16px",
            height: 52,
            display: "flex", alignItems: "center", gap: "12px",
            flexShrink: 0,
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text)", padding: "6px", borderRadius: "var(--radius)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", lineHeight: 1,
              }}
            >
              ☰
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--gold)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: "13px", color: "#000",
              }}>O</div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px" }}>ONIT</span>
              {isAdmin && (
                <span style={{ fontSize: "9px", color: "var(--gold)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Admin
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "20px 16px" : "32px 32px",
          width: "100%",
          boxSizing: "border-box",
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
