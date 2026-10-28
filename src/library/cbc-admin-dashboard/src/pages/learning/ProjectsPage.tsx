import { ResourceListPage } from "@/components/ResourceListPage";
import { projectsApi } from "@/services/resources";
import type { Project } from "@/services/types";

export default function ProjectsPage() {
  return (
    <ResourceListPage<Project>
      title="Projects"
      description="Capstone project briefs — review GitHub/ZIP/demo submissions and approve or reject them."
      api={projectsApi}
      rowKey={(p) => p.id}
      emptyTitle="No projects created yet"
      actions={<button className="btn btn-primary">+ New Project</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "brief", header: "Brief", render: (p) => p.brief.slice(0, 80) + (p.brief.length > 80 ? "..." : "") },
      ]}
    />
  );
}
