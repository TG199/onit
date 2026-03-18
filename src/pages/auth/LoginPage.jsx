import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, ErrorMsg } from "../../components/ui";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const role = await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(from || (role === "admin" ? "/admin" : "/dashboard"), { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px",
      background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)",
    }}>
      <div className="page-enter" style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--gold)", display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: "24px", color: "#000",
            margin: "0 auto 16px",
          }}>O</div>
          <h1 style={{ fontSize: "28px", letterSpacing: "-0.03em" }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
            Sign in to your ONIT account
          </p>
        </div>

        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "32px",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ErrorMsg error={error} />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <Button type="submit" loading={loading} style={{ width: "100%", marginTop: "4px" }}>
              Sign in
            </Button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--gold)", fontWeight: 500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}