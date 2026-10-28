import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { streakApi } from "@/services/resources";
import type { Streak } from "@/services/types";

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreaksScreen() {
  const { brand, colors } = useTheme();
  const [streak, setStreak] = useState<Streak | null>(null);

  useEffect(() => {
    streakApi.get().then(setStreak).catch(() => setStreak({ current_streak_days: 0, longest_streak_days: 0, last_active_date: null }));
  }, []);

  if (!streak) return <Screen><LoadingState label="Loading streak..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1">Learning Streak</AppText>
      <Card style={{ marginTop: 16, alignItems: "center", paddingVertical: 32 }}>
        <AppText style={{ fontSize: 48 }}>🔥</AppText>
        <AppText variant="h1" style={{ marginTop: 8 }}>{streak.current_streak_days} days</AppText>
        <AppText variant="muted">Current streak</AppText>
      </Card>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
        {WEEK_DAYS.map((d, i) => (
          <View key={i} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: i < streak.current_streak_days % 7 ? brand.primary : colors.border, alignItems: "center", justifyContent: "center" }}>
            <AppText style={{ color: i < streak.current_streak_days % 7 ? "#fff" : colors.muted, fontSize: 12 }}>{d}</AppText>
          </View>
        ))}
      </View>

      <Card style={{ marginTop: 20 }}>
        <AppText variant="h3">Longest streak</AppText>
        <AppText variant="h2" style={{ marginTop: 4 }}>{streak.longest_streak_days} days</AppText>
      </Card>
    </Screen>
  );
}
