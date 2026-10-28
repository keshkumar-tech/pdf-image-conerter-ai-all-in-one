import { ResourceListPage } from "@/components/ResourceListPage";
import { auditLogsApi } from "@/services/resources";
import type { AuditLog } from "@/services/types";

export default function AuditLogsPage() {
  return (
    <ResourceListPage<AuditLog>
      title="Audit Logs"
      description="Every state-changing action taken by staff — who, what, when, from which IP."
      api={auditLogsApi}
      rowKey={(a) => a.id}
      emptyTitle="No audit entries yet"
      columns={[
        { key: "action", header: "Action" },
        { key: "entity_type", header: "Entity" },
        { key: "ip_address", header: "IP", render: (a) => a.ip_address ?? "—" },
        { key: "created_at", header: "When", render: (a) => new Date(a.created_at).toLocaleString() },
      ]}
    />
  );
}
