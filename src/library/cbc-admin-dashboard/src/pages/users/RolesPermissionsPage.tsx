import { ResourceListPage } from "@/components/ResourceListPage";
import { rolesApi } from "@/services/resources";
import type { Role } from "@/services/types";

export default function RolesPermissionsPage() {
  return (
    <ResourceListPage<Role>
      title="Roles & Permissions"
      description="Super Admin, Admin, Content Manager, Support, Moderator and Finance roles with RBAC permission sets."
      api={rolesApi}
      rowKey={(r) => r.id}
      emptyTitle="No roles configured"
      columns={[
        { key: "label", header: "Role" },
        { key: "key", header: "Key" },
        { key: "permissions", header: "Permissions", render: (r) => r.permissions.length ? r.permissions.join(", ") : "None" },
      ]}
    />
  );
}
