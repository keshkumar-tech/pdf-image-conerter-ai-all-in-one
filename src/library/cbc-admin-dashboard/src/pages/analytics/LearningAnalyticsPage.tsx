import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { analyticsApi } from "@/services/analytics";
import type { AdminOverview } from "@/services/types";

export default function LearningAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    analyticsApi.overview().then(setData).catch(() => setError("Couldn't load analytics.")).finally(() => setIsLoading(false));
  };
  useEffect(load, []);

  if (isLoading) return <LoadingState label="Loading learning analytics..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title="Learning Analytics" description="Completion, engagement and quiz performance across the platform." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <StatCard label="Course Completion Rate" value={`${data?.course_completion_rate_percent ?? 0}%`} />
        <StatCard label="Active Students" value={data?.active_students ?? 0} />
        <StatCard label="Total Students" value={data?.total_students ?? 0} />
      </div>
      <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: "var(--space-6)" }}>
        Per-course drill-down (lesson-level drop-off, quiz score distributions) reads from the
        same AnalyticsEvent + LessonProgress + QuizAttempt tables and can be filtered from the
        Courses screen once a specific course is selected.
      </p>
    </div>
  );
}
