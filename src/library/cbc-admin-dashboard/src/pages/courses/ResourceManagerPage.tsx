import { ResourceListPage } from "@/components/ResourceListPage";
import { resourcesApi } from "@/services/resources";
import type { LessonResource } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function ResourceManagerPage() {
  return (
    <ResourceListPage<LessonResource>
      title="Resource Manager"
      description="All lesson-level resources across every course: PDFs, source code, ZIPs, templates, cheat sheets and links."
      api={resourcesApi}
      searchPlaceholder="Search resources..."
      rowKey={(r) => r.id}
      emptyTitle="No resources uploaded yet"
      columns={[
        { key: "title", header: "Title" },
        { key: "resource_type", header: "Type", render: (r) => <Badge tone="primary">{r.resource_type}</Badge> },
        { key: "is_premium_only", header: "Access", render: (r) => r.is_premium_only ? <Badge tone="warning">Premium</Badge> : <Badge tone="success">Free</Badge> },
        { key: "download_count", header: "Downloads" },
      ]}
    />
  );
}
