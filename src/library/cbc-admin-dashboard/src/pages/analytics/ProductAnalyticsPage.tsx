import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { analyticsApi } from "@/services/analytics";
import type { AdminOverview } from "@/services/types";

export default function ProductAnalyticsPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    analyticsApi.overview().then(setData).catch(() => setError("Couldn't load analytics.")).finally(() => setIsLoading(false));
  };
  useEffect(load, []);

  if (isLoading) return <LoadingState label="Loading product analytics..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title="Product Analytics" description="Retention, popular courses and feature usage." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
        <StatCard label="Total Courses" value={data?.total_courses ?? 0} />
        <StatCard label="Premium Conversion" value={`${data?.conversion_rate_percent ?? 0}%`} />
        <StatCard label="30-day Active Students" value={data?.active_students ?? 0} />
      </div>
    </div>
  );
}
