import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { analyticsApi } from "@/services/analytics";
import type { YouTubeFunnelRow } from "@/services/types";

export default function SalesFunnelPage() {
  const [rows, setRows] = useState<YouTubeFunnelRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    analyticsApi.youtubeFunnel().then(setRows).catch(() => setError("Couldn't load funnel data.")).finally(() => setIsLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Sales / YouTube → App Funnel" description="Tracks the path from YouTube video to app install, signup, course enrollment and purchase, broken down by UTM source." />
      <DataTable
        rowKey={(r: YouTubeFunnelRow) => r.utm_source}
        columns={[
          { key: "utm_source", header: "UTM Source" },
          { key: "installs", header: "Installs" },
          { key: "signups", header: "Signups" },
          { key: "enrollments", header: "Enrollments" },
          { key: "purchases", header: "Purchases (₹499 conversions)" },
        ]}
        rows={rows}
        isLoading={isLoading}
        error={error}
        onRetry={load}
        emptyTitle="No campaign data yet"
        emptyDescription="Funnel data appears once analytics events carry a utm_source (e.g. from app-install deep links)."
      />
    </div>
  );
}
