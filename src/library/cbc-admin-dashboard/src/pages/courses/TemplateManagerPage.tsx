import { ResourceListPage } from "@/components/ResourceListPage";
import { resourcesApi } from "@/services/resources";
import type { LessonResource } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function TemplateManagerPage() {
  return (
    <ResourceListPage<LessonResource>
      title="Template Manager"
      description="Reusable project templates and boilerplates offered to students."
      api={{ list: (params) => resourcesApi.list({ ...params, resource_type: "template" }) }}
      rowKey={(r) => r.id}
      emptyTitle="No templates uploaded yet"
      actions={<button className="btn btn-primary">+ Upload Template</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "is_premium_only", header: "Access", render: (r) => r.is_premium_only ? <Badge tone="warning">Premium</Badge> : <Badge tone="success">Free</Badge> },
        { key: "download_count", header: "Downloads" },
      ]}
    />
  );
}
