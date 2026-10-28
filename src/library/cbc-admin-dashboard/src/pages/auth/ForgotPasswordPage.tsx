import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Check your email</h2>
        <p style={{ color: "var(--color-muted)", fontSize: 14 }}>
          If an account exists for {email}, an OTP has been sent to reset the password.
        </p>
        <Link to="/login" className="btn btn-secondary" style={{ marginTop: "var(--space-4)", display: "inline-block" }}>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0, marginBottom: "var(--space-2)", fontSize: 20 }}>Forgot password</h2>
      <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: "var(--space-6)" }}>
        Enter your admin email and we'll send a reset OTP.
      </p>
      <label style={{ display: "block", marginBottom: "var(--space-5)" }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset OTP"}
      </button>
      <div style={{ textAlign: "center", marginTop: "var(--space-4)" }}>
        <Link to="/login" style={{ fontSize: 13 }}>Back to login</Link>
      </div>
    </form>
  );
}
