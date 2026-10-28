import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";

export default function GeneralSettingsPage() {
  return (
    <div>
      <PageHeader title="General Settings" description="Platform-wide defaults." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        <FormField label="Platform Name"><input defaultValue="Coding with Kesh" /></FormField>
        <FormField label="Default Currency"><input defaultValue="INR" /></FormField>
        <FormField label="Default Timezone"><input defaultValue="Asia/Kolkata" /></FormField>
        <FormField label="Support Email"><input defaultValue="support@codingwithkesh.com" /></FormField>
        <button className="btn btn-primary">Save General Settings</button>
      </div>
    </div>
  );
}
