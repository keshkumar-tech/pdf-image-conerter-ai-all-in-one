import { ResourceListPage } from "@/components/ResourceListPage";
import { resourcesApi } from "@/services/resources";
import type { LessonResource } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function SourceCodeManagerPage() {
  return (
    <ResourceListPage<LessonResource>
      title="Source Code Manager"
      description="Source code bundles attached to lessons, with syntax-highlighted preview support (JS/TS/Python/HTML/CSS/SQL/Django/React Native)."
      api={{ list: (params) => resourcesApi.list({ ...params, resource_type: "source_code" }) }}
      rowKey={(r) => r.id}
      emptyTitle="No source code uploaded yet"
      actions={<button className="btn btn-primary">+ Upload Source Code</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "is_premium_only", header: "Access", render: (r) => r.is_premium_only ? <Badge tone="warning">Premium</Badge> : <Badge tone="success">Free</Badge> },
        { key: "download_count", header: "Downloads" },
      ]}
    />
  );
}
