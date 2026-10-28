import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useTheme } from "@/theme/ThemeProvider";

export function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { mode, setMode } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 var(--space-6)", borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)", position: "sticky", top: 0, zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button className="btn btn-secondary" onClick={toggleSidebar} aria-label="Toggle sidebar">☰</button>
        <input
          placeholder="Search anything... (Cmd+K)"
          style={{ width: 320 }}
          onFocus={() => navigate("/account/search")}
          readOnly
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={{ width: 110 }}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <div
          onClick={() => navigate("/account/profile")}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%", background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700,
            }}
          >
            {(user?.username || "A")[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.username || "Admin"}</span>
        </div>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
