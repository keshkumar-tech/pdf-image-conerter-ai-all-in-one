import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div>
      <PageHeader title="Maintenance Mode" description="Temporarily block student access while you deploy changes." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
          <div>
            <strong>Maintenance Mode</strong>
            <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
              When enabled, the student app and web preview show a maintenance screen.
            </div>
          </div>
          <Badge tone={enabled ? "danger" : "success"}>{enabled ? "ON" : "OFF"}</Badge>
        </div>
        <button className={enabled ? "btn btn-secondary" : "btn btn-danger"} onClick={() => setEnabled((e) => !e)}>
          {enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        </button>
      </div>
    </div>
  );
}
