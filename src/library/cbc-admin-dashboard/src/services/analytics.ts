import { apiClient } from "./apiClient";
import type { AdminOverview, YouTubeFunnelRow } from "./types";

export const analyticsApi = {
  overview: () => apiClient.get<AdminOverview>("/analytics/admin/overview/").then((r) => r.data),
  youtubeFunnel: () => apiClient.get<YouTubeFunnelRow[]>("/analytics/admin/youtube-funnel/").then((r) => r.data),
};
