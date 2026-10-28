import type { ReactNode } from "react";

export function FormField({
  label, hint, children,
}: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "var(--space-4)" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</span>
      {children}
      {hint && <span style={{ display: "block", fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>{hint}</span>}
    </label>
  );
}
