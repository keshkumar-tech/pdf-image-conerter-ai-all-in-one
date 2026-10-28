import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";

export default function AppConfigurationPage() {
  return (
    <div>
      <PageHeader title="App Configuration" description="Mobile app feature flags and minimum supported version." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 560 }}>
        <FormField label="Minimum Android Version"><input defaultValue="1.0.0" /></FormField>
        <FormField label="Minimum iOS Version"><input defaultValue="1.0.0" /></FormField>
        <FormField label="Force Update"><select defaultValue="no"><option value="no">No</option><option value="yes">Yes</option></select></FormField>
        <FormField label="Offline Downloads Enabled"><select defaultValue="yes"><option value="yes">Yes</option><option value="no">No</option></select></FormField>
        <button className="btn btn-primary">Save App Configuration</button>
      </div>
    </div>
  );
}
