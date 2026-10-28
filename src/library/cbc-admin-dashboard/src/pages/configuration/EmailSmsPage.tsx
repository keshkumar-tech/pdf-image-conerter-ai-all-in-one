import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";

export default function EmailSmsPage() {
  return (
    <div>
      <PageHeader title="Email / SMS" description="Transactional email and SMS provider configuration." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Email (SMTP)</h3>
          <FormField label="Host"><input placeholder="smtp.example.com" /></FormField>
          <FormField label="Port"><input type="number" defaultValue={587} /></FormField>
          <FormField label="Username"><input /></FormField>
          <FormField label="Password" hint="Masked — never sent to the client"><input type="password" /></FormField>
          <button className="btn btn-primary">Save Email Settings</button>
        </div>
        <div className="card" style={{ padding: "var(--space-6)" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>SMS</h3>
          <FormField label="Provider"><input placeholder="e.g. MSG91, Twilio" /></FormField>
          <FormField label="API Key" hint="Masked — never sent to the client"><input type="password" /></FormField>
          <button className="btn btn-primary">Save SMS Settings</button>
        </div>
      </div>
    </div>
  );
}
