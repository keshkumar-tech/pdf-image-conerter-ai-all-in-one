import { ResourceListPage } from "@/components/ResourceListPage";
import { reportsApi } from "@/services/resources";
import type { Report } from "@/services/types";
import { Badge, statusTone } from "@/components/Badge";

export default function CommunityModerationPage() {
  return (
    <ResourceListPage<Report>
      title="Community Moderation"
      description="Reported posts awaiting review. Hide, delete, or dismiss reports and manage categories."
      api={reportsApi}
      rowKey={(r) => r.id}
      emptyTitle="No reports"
      emptyDescription="The community queue is clear."
      columns={[
        { key: "reason", header: "Reason" },
        { key: "status", header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
        { key: "created_at", header: "Reported", render: (r) => new Date(r.created_at).toLocaleString() },
      ]}
    />
  );
}
