import { forwardRef } from "react";

// ─── Button ──────────────────────────────────────────────────────────────────
const btnBase = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  gap: "8px", fontFamily: "var(--font-body)", fontWeight: 500,
  borderRadius: "var(--radius)", transition: "all var(--transition)",
  cursor: "pointer", border: "none", whiteSpace: "nowrap",
};

const btnVariants = {
  primary: {
    background: "var(--gold)", color: "#000",
    padding: "11px 22px", fontSize: "14px",
  },
  secondary: {
    background: "var(--bg-elevated)", color: "var(--text)",
    border: "1px solid var(--border)", padding: "10px 22px", fontSize: "14px",
  },
  ghost: {
    background: "transparent", color: "var(--text-secondary)",
    padding: "10px 16px", fontSize: "14px",
  },
  danger: {
    background: "var(--danger-bg)", color: "var(--danger)",
    border: "1px solid rgba(231,76,60,0.2)", padding: "10px 22px", fontSize: "14px",
  },
  success: {
    background: "var(--success-bg)", color: "var(--success)",
    border: "1px solid rgba(46,204,113,0.2)", padding: "10px 22px", fontSize: "14px",
  },
};

const btnSizes = {
  sm: { padding: "7px 14px", fontSize: "12px" },
  md: {},
  lg: { padding: "14px 28px", fontSize: "16px" },
};

export function Button({
  variant = "primary", size = "md", loading = false,
  disabled = false, children, style, ...props
}) {
  return (
    <button
      style={{
        ...btnBase,
        ...btnVariants[variant],
        ...btnSizes[size],
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={14} color="currentColor" />}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export const Input = forwardRef(function Input(
  { label, error, hint, prefix, suffix, style, containerStyle, ...props }, ref
) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...containerStyle }}>
      {label && (
        <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: "12px", color: "var(--text-muted)",
            fontSize: "14px", pointerEvents: "none",
          }}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          style={{
            width: "100%", background: "var(--bg-elevated)",
            border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
            borderRadius: "var(--radius)", color: "var(--text)",
            fontSize: "14px", padding: `10px 12px`,
            paddingLeft: prefix ? "36px" : "12px",
            paddingRight: suffix ? "36px" : "12px",
            transition: "border-color var(--transition)",
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "var(--danger)" : "var(--gold)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "var(--danger)" : "var(--border)";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {suffix && (
          <span style={{
            position: "absolute", right: "12px", color: "var(--text-muted)",
            fontSize: "14px", pointerEvents: "none",
          }}>
            {suffix}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize: "12px", color: "var(--danger)" }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{hint}</span>}
    </div>
  );
});

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, error, children, style, containerStyle, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...containerStyle }}>
      {label && (
        <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: "100%", background: "var(--bg-elevated)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "var(--radius)", color: "var(--text)",
          fontSize: "14px", padding: "10px 12px",
          appearance: "none", cursor: "pointer",
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: "12px", color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────
export function Textarea({ label, error, style, containerStyle, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...containerStyle }}>
      {label && (
        <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          width: "100%", background: "var(--bg-elevated)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "var(--radius)", color: "var(--text)",
          fontSize: "14px", padding: "10px 12px", resize: "vertical", minHeight: "80px",
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: "12px", color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, hover = false, gold = false, ...props }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: gold ? "1px solid var(--gold-border)" : "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "20px",
        transition: "all var(--transition)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: gold ? "var(--shadow-gold)" : "none",
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.background = "var(--bg-elevated)";
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.borderColor = gold ? "var(--gold-border)" : "var(--border)";
        e.currentTarget.style.background = "var(--bg-card)";
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, icon }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: "18px", opacity: 0.6 }}>{icon}</span>}
      </div>
      <div>
        <div style={{ fontSize: "28px", fontFamily: "var(--font-display)", fontWeight: 700, color: accent || "var(--text)" }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>{sub}</div>}
      </div>
    </Card>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = "var(--gold)" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Page Spinner ─────────────────────────────────────────────────────────────
export function PageSpinner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh",
    }}>
      <Spinner size={32} />
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "12px", padding: "60px 20px", color: "var(--text-secondary)", textAlign: "center",
    }}>
      <div style={{ fontSize: "40px", opacity: 0.5 }}>{icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, color: "var(--text)" }}>
        {title}
      </div>
      {description && <div style={{ fontSize: "14px", maxWidth: "300px" }}>{description}</div>}
      {action}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)", width: "100%", maxWidth: `${width}px`,
        maxHeight: "90vh", overflow: "auto",
        animation: "fadeUp 0.2s ease both",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
        }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--text-secondary)",
              fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "0 4px",
            }}
          >×</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyState }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: "10px 14px", textAlign: "left", fontSize: "11px",
                fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "12px 14px" }}>
                    <div className="skeleton" style={{ height: "16px", width: "80%" }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                {emptyState || <EmptyState title="No data" />}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} style={{
                borderBottom: "1px solid var(--border)",
                transition: "background var(--transition)",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
                onMouseLeave={(e) => e.currentTarget.style.background = ""}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{
                    padding: "12px 14px", fontSize: "13px", color: "var(--text)",
                  }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Error Message ────────────────────────────────────────────────────────────
export function ErrorMsg({ error }) {
  if (!error) return null;
  const msg = error?.response?.data?.error || error?.message || "Something went wrong";
  return (
    <div style={{
      background: "var(--danger-bg)", border: "1px solid rgba(231,76,60,0.2)",
      borderRadius: "var(--radius)", padding: "10px 14px",
      fontSize: "13px", color: "var(--danger)",
    }}>
      {msg}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}