import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, EmptyState } from "@/components/StatusStates";
import { myAchievementsApi } from "@/services/resources";

interface EarnedAchievement { id: string; achievement: { title: string; description: string; icon: string }; earned_at: string; }

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<EarnedAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    myAchievementsApi.list().then((res: any) => setAchievements(res.results)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Screen><LoadingState label="Loading achievements..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Achievements</AppText>
      {achievements.length === 0 ? (
        <EmptyState title="No achievements yet" description="Complete lessons, quizzes and streaks to unlock badges." />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {achievements.map((a) => (
            <Card key={a.id} style={{ width: "47%", alignItems: "center", paddingVertical: 20 }}>
              <AppText style={{ fontSize: 32 }}>{a.achievement.icon || "🏅"}</AppText>
              <AppText variant="h3" style={{ marginTop: 8, textAlign: "center" }}>{a.achievement.title}</AppText>
              <AppText variant="caption" style={{ textAlign: "center", marginTop: 4 }}>{a.achievement.description}</AppText>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
