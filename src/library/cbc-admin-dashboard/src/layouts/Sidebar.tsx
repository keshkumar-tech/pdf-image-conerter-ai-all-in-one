import { NavLink } from "react-router-dom";
import { navGroups } from "./navConfig";
import { useUiStore } from "@/store/uiStore";

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className="scrollbar-thin"
      style={{
        width: collapsed ? 76 : 264, transition: "width 0.2s ease", flexShrink: 0,
        background: "var(--color-surface)", borderRight: "1px solid var(--color-border)",
        height: "100vh", overflowY: "auto", position: "sticky", top: 0,
      }}
    >
      <div style={{ padding: "var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800,
            flexShrink: 0,
          }}
        >
          K
        </div>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: 15 }}>Coding with Kesh</span>}
      </div>

      <nav style={{ padding: "0 var(--space-3) var(--space-6)" }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: "var(--space-5)" }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
                  color: "var(--color-muted)", fontWeight: 700, padding: "0 var(--space-3)", marginBottom: 6,
                }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "9px var(--space-3)", borderRadius: "var(--radius-sm)",
                  fontSize: 14, fontWeight: 500, color: isActive ? "var(--color-primary)" : "var(--color-text)",
                  background: isActive ? "rgba(108,92,231,0.1)" : "transparent",
                  marginBottom: 2,
                })}
              >
                <span
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "currentColor", opacity: 0.6, flexShrink: 0,
                  }}
                />
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
