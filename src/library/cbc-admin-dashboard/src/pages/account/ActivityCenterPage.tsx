import { ResourceListPage } from "@/components/ResourceListPage";
import { auditLogsApi } from "@/services/resources";
import type { AuditLog } from "@/services/types";

export default function ActivityCenterPage() {
  return (
    <ResourceListPage<AuditLog>
      title="Activity Center"
      description="Your recent admin activity across the platform."
      api={auditLogsApi}
      rowKey={(a) => a.id}
      emptyTitle="No activity yet"
      columns={[
        { key: "action", header: "Action" },
        { key: "entity_type", header: "Entity" },
        { key: "created_at", header: "When", render: (a) => new Date(a.created_at).toLocaleString() },
      ]}
    />
  );
}
