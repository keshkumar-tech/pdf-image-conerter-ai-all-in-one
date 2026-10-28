import { ResourceListPage } from "@/components/ResourceListPage";
import { assignmentsApi } from "@/services/resources";
import type { Assignment } from "@/services/types";

export default function AssignmentsPage() {
  return (
    <ResourceListPage<Assignment>
      title="Assignments"
      description="Assignment briefs, deadlines and grading — review student submissions from here."
      api={assignmentsApi}
      rowKey={(a) => a.id}
      emptyTitle="No assignments created yet"
      actions={<button className="btn btn-primary">+ New Assignment</button>}
      columns={[
        { key: "title", header: "Title" },
        { key: "deadline_days", header: "Deadline", render: (a) => a.deadline_days ? `${a.deadline_days} days after enrollment` : "No deadline" },
        { key: "max_score", header: "Max Score" },
      ]}
    />
  );
}
