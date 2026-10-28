import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--gradient-primary)", padding: "var(--space-5)",
      }}
    >
      <div className="card" style={{ width: "min(420px, 100%)", padding: "var(--space-8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800,
            }}
          >
            K
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Coding with Kesh</div>
            <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Admin Dashboard</div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
