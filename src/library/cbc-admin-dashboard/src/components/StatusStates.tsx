import type { ReactNode } from "react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="card" style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-muted)" }}>
      <div
        style={{
          width: 28, height: 28, margin: "0 auto var(--space-4)",
          border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {label}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>📭</div>
      <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
      {description && (
        <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 4 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: "var(--space-5)" }}>{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="card"
      style={{ padding: "var(--space-8)", textAlign: "center", borderColor: "var(--color-danger)" }}
    >
      <div style={{ fontSize: 32, marginBottom: "var(--space-3)" }}>⚠️</div>
      <p style={{ color: "var(--color-danger)", fontWeight: 600, margin: 0 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" style={{ marginTop: "var(--space-5)" }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
