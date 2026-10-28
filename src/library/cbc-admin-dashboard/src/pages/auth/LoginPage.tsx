import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { user, access, refresh } = await authApi.login(email, password);
      setTokens(access, refresh);
      setUser(user);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0, marginBottom: "var(--space-2)", fontSize: 20 }}>Welcome back</h2>
      <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: "var(--space-6)" }}>
        Sign in to manage courses, students and orders.
      </p>

      <label style={{ display: "block", marginBottom: "var(--space-4)" }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@codingwithkesh.com" />
      </label>

      <label style={{ display: "block", marginBottom: "var(--space-2)" }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</span>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </label>

      <div style={{ textAlign: "right", marginBottom: "var(--space-5)" }}>
        <Link to="/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
      </div>

      {error && (
        <div style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: "var(--space-4)" }}>{error}</div>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
