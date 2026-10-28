type BadgeTone = "neutral" | "success" | "warning" | "danger" | "primary";

const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: "var(--color-border)", fg: "var(--color-text)" },
  success: { bg: "rgba(18,183,106,0.12)", fg: "var(--color-success)" },
  warning: { bg: "rgba(247,144,9,0.12)", fg: "var(--color-warning)" },
  danger: { bg: "rgba(240,68,56,0.12)", fg: "var(--color-danger)" },
  primary: { bg: "rgba(108,92,231,0.12)", fg: "var(--color-primary)" },
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  const c = toneColors[tone];
  return (
    <span
      style={{
        display: "inline-block", padding: "2px 10px", borderRadius: "var(--radius-pill)",
        fontSize: 12, fontWeight: 600, background: c.bg, color: c.fg,
      }}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (["success", "active", "published", "resolved", "approved", "sent"].includes(s)) return "success";
  if (["pending", "created", "in_progress", "scheduled", "draft"].includes(s)) return "warning";
  if (["failed", "cancelled", "rejected", "refunded", "closed"].includes(s)) return "danger";
  return "neutral";
}
