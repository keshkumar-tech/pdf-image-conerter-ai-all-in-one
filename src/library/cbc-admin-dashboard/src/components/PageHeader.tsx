import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "var(--space-6)",
        gap: "var(--space-4)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{title}</h1>
        {description && (
          <p style={{ color: "var(--color-muted)", marginTop: 4, fontSize: 14 }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: "var(--space-3)" }}>{actions}</div>}
    </div>
  );
}
