import { ResourceListPage } from "@/components/ResourceListPage";
import { roadmapsApi } from "@/services/resources";
import type { Roadmap } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function RoadmapsPage() {
  return (
    <ResourceListPage<Roadmap>
      title="Roadmaps"
      description="Learning paths (e.g. Frontend Developer → HTML → CSS → JavaScript → React → ...) that guide students from course to course."
      api={roadmapsApi}
      rowKey={(r) => r.id}
      emptyTitle="No roadmaps created yet"
      actions={<button className="btn btn-primary">+ New Roadmap</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "nodes", header: "Stages", render: (r) => r.nodes?.length ?? 0 },
        { key: "is_published", header: "Status", render: (r) => r.is_published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge> },
      ]}
    />
  );
}
