import { ResourceListPage } from "@/components/ResourceListPage";
import { resourcesApi } from "@/services/resources";
import type { LessonResource } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function PdfManagerPage() {
  return (
    <ResourceListPage<LessonResource>
      title="PDF Manager"
      description="Upload, replace and restrict access to lesson PDFs."
      api={{ list: (params) => resourcesApi.list({ ...params, resource_type: "pdf" }) }}
      rowKey={(r) => r.id}
      emptyTitle="No PDFs uploaded yet"
      actions={<button className="btn btn-primary">+ Upload PDF</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "is_premium_only", header: "Access", render: (r) => r.is_premium_only ? <Badge tone="warning">Premium</Badge> : <Badge tone="success">Free</Badge> },
        { key: "download_count", header: "Downloads" },
      ]}
    />
  );
}
