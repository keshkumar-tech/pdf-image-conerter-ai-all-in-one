import { apiClient } from "./apiClient";
import type { StudentAnalytics } from "./types";

export const analyticsApi = {
  me: () => apiClient.get<StudentAnalytics>("/analytics/me/").then((r) => r.data),
  track: (eventName: string, properties?: Record<string, unknown>, utm?: { source?: string; campaign?: string; medium?: string }) =>
    apiClient.post("/analytics/events/", {
      event_name: eventName, properties: properties ?? {},
      utm_source: utm?.source ?? "", utm_campaign: utm?.campaign ?? "", utm_medium: utm?.medium ?? "",
    }).then((r) => r.data),
};
