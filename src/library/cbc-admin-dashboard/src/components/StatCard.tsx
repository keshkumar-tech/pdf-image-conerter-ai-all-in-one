interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export function StatCard({ label, value, delta, deltaTone = "neutral", icon }: StatCardProps) {
  const deltaColor =
    deltaTone === "up" ? "var(--color-success)" : deltaTone === "down" ? "var(--color-danger)" : "var(--color-muted)";
  return (
    <div className="card" style={{ padding: "var(--space-5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>{label}</span>
        {icon && <div style={{ color: "var(--color-primary)" }}>{icon}</div>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: "var(--space-2)" }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 12, color: deltaColor, marginTop: 4, fontWeight: 600 }}>{delta}</div>
      )}
    </div>
  );
}
