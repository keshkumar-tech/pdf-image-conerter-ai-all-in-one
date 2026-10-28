import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { analyticsApi } from "@/services/analytics";
import type { AdminOverview } from "@/services/types";

export default function AnalyticsOverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    analyticsApi.overview().then(setData).catch(() => setError("Couldn't load analytics.")).finally(() => setIsLoading(false));
  };
  useEffect(load, []);

  if (isLoading) return <LoadingState label="Crunching numbers..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const chartData = [
    { name: "Free Courses", value: data.free_courses },
    { name: "Premium Courses", value: data.premium_courses },
  ];

  return (
    <div>
      <PageHeader title="Analytics Overview" description="Platform-wide revenue, growth and conversion metrics." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <StatCard label="Total Revenue" value={`₹${data.total_revenue}`} />
        <StatCard label="Total Orders" value={data.total_orders} />
        <StatCard label="Conversion Rate" value={`${data.conversion_rate_percent}%`} />
        <StatCard label="Completion Rate" value={`${data.course_completion_rate_percent}%`} />
        <StatCard label="New Signups (30d)" value={data.new_registrations_30d} />
      </div>
      <div className="card" style={{ padding: "var(--space-6)", height: 320 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>Free vs Premium Courses</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} />
            <YAxis stroke="var(--color-muted)" fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
