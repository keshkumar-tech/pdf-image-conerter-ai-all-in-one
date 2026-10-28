import { useNavigate } from "react-router-dom";
import { ResourceListPage } from "@/components/ResourceListPage";
import { usersApi } from "@/services/resources";
import type { AdminUser } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function UsersPage() {
  const navigate = useNavigate();
  return (
    <ResourceListPage<AdminUser>
      title="Users"
      description="All students, admins and staff on the platform."
      api={usersApi}
      searchPlaceholder="Search by name, email or phone..."
      rowKey={(u) => u.id}
      onRowClick={(u) => navigate(`/users/${u.id}`)}
      emptyTitle="No users found"
      emptyDescription="Users will appear here as students register."
      columns={[
        { key: "email", header: "Email" },
        { key: "username", header: "Name" },
        { key: "phone", header: "Phone" },
        { key: "role", header: "Role", render: (u) => u.role ? <Badge tone="primary">{u.role.label}</Badge> : "—" },
        { key: "is_email_verified", header: "Verified", render: (u) => u.is_email_verified ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge> },
        { key: "created_at", header: "Joined", render: (u) => new Date(u.created_at).toLocaleDateString() },
      ]}
    />
  );
}
