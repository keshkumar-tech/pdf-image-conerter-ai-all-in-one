import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: "var(--color-primary)" }}>404</div>
      <h2>Page not found</h2>
      <p style={{ color: "var(--color-muted)" }}>The page you're looking for doesn't exist or was moved.</p>
      <Link to="/dashboard" className="btn btn-primary" style={{ display: "inline-block", marginTop: "var(--space-4)" }}>
        Back to Dashboard
      </Link>
    </div>
  );
}
