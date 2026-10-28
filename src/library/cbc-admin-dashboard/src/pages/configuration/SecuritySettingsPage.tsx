import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";

export default function SecuritySettingsPage() {
  return (
    <div>
      <PageHeader title="Security Settings" description="JWT lifetimes, rate limiting and password policy." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        <FormField label="Access Token Lifetime (minutes)"><input defaultValue={30} type="number" /></FormField>
        <FormField label="Refresh Token Lifetime (days)"><input defaultValue={14} type="number" /></FormField>
        <FormField label="Anonymous rate limit (requests/hour)"><input defaultValue={100} type="number" /></FormField>
        <FormField label="Authenticated rate limit (requests/hour)"><input defaultValue={1000} type="number" /></FormField>
        <FormField label="Minimum password length"><input defaultValue={8} type="number" /></FormField>
        <button className="btn btn-primary">Save Security Settings</button>
      </div>
    </div>
  );
}
