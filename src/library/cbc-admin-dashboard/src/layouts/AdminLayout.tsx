import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Topbar />
        <main style={{ padding: "var(--space-6)", maxWidth: 1400, margin: "0 auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
