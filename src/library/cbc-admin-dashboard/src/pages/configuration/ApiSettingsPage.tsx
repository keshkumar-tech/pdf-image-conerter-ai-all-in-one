import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";

export default function ApiSettingsPage() {
  const [form, setForm] = useState({
    backendUrl: "https://api.codingwithkesh.com", apiVersion: "v1", environment: "production", maintenanceMode: false,
  });
  return (
    <div>
      <PageHeader title="API Settings" description="Backend URL, versioning and environment used by the mobile app and web preview." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        <FormField label="Backend URL">
          <input value={form.backendUrl} onChange={(e) => setForm((f) => ({ ...f, backendUrl: e.target.value }))} />
        </FormField>
        <FormField label="API Version">
          <input value={form.apiVersion} onChange={(e) => setForm((f) => ({ ...f, apiVersion: e.target.value }))} />
        </FormField>
        <FormField label="Environment">
          <select value={form.environment} onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))}>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </FormField>
        <button className="btn btn-primary">Save API Settings</button>
      </div>
    </div>
  );
}
