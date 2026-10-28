import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { analyticsApi } from "@/services/analytics";
import type { StudentAnalytics } from "@/services/types";

export default function LearningAnalyticsScreen() {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    analyticsApi.me().then(setData).catch(() => setError("Couldn't load your analytics."));
  };
  useEffect(load, []);

  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><LoadingState label="Crunching your stats..." /></Screen>;

  const stats = [
    { label: "Study Time", value: `${Math.round(data.study_time_minutes / 60)}h ${data.study_time_minutes % 60}m` },
    { label: "Courses Completed", value: data.courses_completed },
    { label: "Lessons Completed", value: data.lessons_completed },
    { label: "Quiz Average", value: `${data.quiz_average_percent}%` },
    { label: "Assignments Submitted", value: data.assignments_submitted },
    { label: "Projects Submitted", value: data.projects_submitted },
    { label: "Current Streak", value: `${data.current_streak_days} days` },
  ];

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Learning Analytics</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ width: "47%" }}>
            <AppText variant="caption">{s.label}</AppText>
            <AppText variant="h2" style={{ marginTop: 4 }}>{s.value}</AppText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
