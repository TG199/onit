import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, ErrorMsg } from "../../components/ui";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "", phone: "", password: "", confirmPassword: "", location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.phone) errs.phone = "Phone number is required";
    if (!form.password || form.password.length < 6) errs.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await register({ email: form.email, phone: form.phone, password: form.password, location: form.location });
      // Auto-login after register
      const role = await login(form.email, form.password);
      toast.success("Account created! Welcome to ONIT.");
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
        console.log(err)
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px",
      background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)",
    }}>
      <div className="page-enter" style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--gold)", display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: "24px", color: "#000",
            margin: "0 auto 16px",
          }}>O</div>
          <h1 style={{ fontSize: "28px", letterSpacing: "-0.03em" }}>Create account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
            Start earning with ONIT today
          </p>
        </div>

        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "32px",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <ErrorMsg error={error} />

            <Input label="Email address" type="email" placeholder="you@example.com"
              value={form.email} onChange={set("email")} error={fieldErrors.email} required />

            <Input label="Phone number" type="tel" placeholder="+234 800 000 0000"
              value={form.phone} onChange={set("phone")} error={fieldErrors.phone} required />

            <Input label="Location" placeholder="Lagos, Nigeria"
              value={form.location} onChange={set("location")}
              hint="City or region you're based in" />

            <Input label="Password" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={set("password")} error={fieldErrors.password} required />

            <Input label="Confirm password" type="password" placeholder="Repeat password"
              value={form.confirmPassword} onChange={set("confirmPassword")}
              error={fieldErrors.confirmPassword} required />

            <Button type="submit" loading={loading} style={{ width: "100%", marginTop: "4px" }}>
              Create account
            </Button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--gold)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}