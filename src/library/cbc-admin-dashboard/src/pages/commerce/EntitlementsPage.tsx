import { ResourceListPage } from "@/components/ResourceListPage";
import { entitlementsApi } from "@/services/resources";
import type { Entitlement } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function EntitlementsPage() {
  return (
    <ResourceListPage<Entitlement>
      title="Entitlements"
      description="The source of truth for course access — grants from purchases, admin overrides, or free courses."
      api={entitlementsApi}
      rowKey={(e) => e.id}
      emptyTitle="No entitlements granted yet"
      actions={<button className="btn btn-primary">+ Grant Entitlement</button>}
      columns={[
        { key: "user", header: "User" },
        { key: "course", header: "Course" },
        { key: "granted_reason", header: "Reason", render: (e) => <Badge tone="primary">{e.granted_reason}</Badge> },
        { key: "is_active", header: "Status", render: (e) => e.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Revoked</Badge> },
        { key: "expires_at", header: "Expires", render: (e) => e.expires_at ? new Date(e.expires_at).toLocaleDateString() : "Lifetime" },
      ]}
    />
  );
}
