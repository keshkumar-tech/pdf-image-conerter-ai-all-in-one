import { useNavigate } from "react-router-dom";
import { ResourceListPage } from "@/components/ResourceListPage";
import { coursesApi } from "@/services/resources";
import type { Course } from "@/services/types";
import { Badge } from "@/components/Badge";

export default function CoursesPage() {
  const navigate = useNavigate();
  return (
    <ResourceListPage<Course>
      title="Courses"
      description="Every course on the platform - free and premium."
      api={coursesApi}
      searchPlaceholder="Search courses..."
      rowKey={(c) => c.id}
      onRowClick={(c) => navigate(`/courses/${c.id}/edit`)}
      emptyTitle="No courses yet"
      emptyDescription="Create your first course to get started."
      actions={
        <button className="btn btn-primary" onClick={() => navigate("/courses/new")}>+ New Course</button>
      }
      columns={[
        { key: "title", header: "Title" },
        { key: "category", header: "Category", render: (c) => c.category?.name ?? "—" },
        { key: "pricing", header: "Pricing", render: (c) => c.is_free ? <Badge tone="success">Free</Badge> : <Badge tone="primary">₹{c.pricing_plan?.price ?? "—"}</Badge> },
        { key: "students_count", header: "Students" },
        { key: "rating_average", header: "Rating", render: (c) => `${c.rating_average} ★` },
        { key: "is_published", header: "Status", render: (c) => c.is_published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge> },
      ]}
    />
  );
}
