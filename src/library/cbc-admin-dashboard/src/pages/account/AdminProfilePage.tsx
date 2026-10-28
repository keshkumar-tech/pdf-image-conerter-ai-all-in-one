import { PageHeader } from "@/components/PageHeader";
import { FormField } from "@/components/FormField";
import { useAuthStore } from "@/store/authStore";

export default function AdminProfilePage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <PageHeader title="Admin Profile" description="Your account details and preferences." />
      <div className="card" style={{ padding: "var(--space-6)", maxWidth: 480 }}>
        <FormField label="Username"><input defaultValue={user?.username ?? ""} /></FormField>
        <FormField label="Email"><input defaultValue={user?.email ?? ""} disabled /></FormField>
        <FormField label="Role"><input defaultValue={user?.role?.label ?? "—"} disabled /></FormField>
        <button className="btn btn-primary">Save Profile</button>
      </div>
    </div>
  );
}
