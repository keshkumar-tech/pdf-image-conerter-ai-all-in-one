import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";

export default function BrandingPage() {
  return (
    <div>
      <PageHeader title="Branding" description="Logo, colors and typography used across student app and admin." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        <FormField label="Primary Color"><input type="color" defaultValue="#6C5CE7" style={{ height: 44 }} /></FormField>
        <FormField label="Secondary Color"><input type="color" defaultValue="#22D3EE" style={{ height: 44 }} /></FormField>
        <FormField label="Logo URL"><input placeholder="https://.../logo.svg" /></FormField>
        <FormField label="Primary Font"><input defaultValue="Plus Jakarta Sans" /></FormField>
        <button className="btn btn-primary">Save Branding</button>
      </div>
    </div>
  );
}
