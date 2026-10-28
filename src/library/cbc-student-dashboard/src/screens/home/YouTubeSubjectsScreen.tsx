import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { useStudentClassStore } from "@/store/studentClassStore";
import { youtubeSubjectsApi } from "@/services/resources";
import type { YouTubeSubject } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "YouTubeSubjects">;

const CLASS_MAP: Record<string, string> = {
  "CLASS 9th": "Class 9", "CLASS 10th": "Class 10",
  "CLASS 11th": "Class 11", "CLASS 12th": "Class 12",
};

export default function YouTubeSubjectsScreen({ navigation }: Props) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const currentClassLevel = CLASS_MAP[selectedClass] ?? "Class 10";

  const [subjects, setSubjects] = useState<YouTubeSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await youtubeSubjectsApi.list({ class_level: currentClassLevel, is_active: true });
      setSubjects(res.results);
    } catch {
      setError("Could not load subjects.");
    } finally {
      setIsLoading(false); setRefreshing(false);
    }
  }, [currentClassLevel]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading subjects..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>▶️ YouTube Lectures</AppText>
        <AppText style={[styles.headerSub, { color: colors.muted }]}>
          {currentClassLevel} — Select a subject to browse videos
        </AppText>
      </View>

      <View style={[styles.classBanner, { backgroundColor: isDark ? "#1a2236" : "#F0F4FF" }]}>
        <View style={[styles.classPill, { backgroundColor: brand.primary }]}>
          <AppText style={styles.classPillText}>{currentClassLevel}</AppText>
        </View>
        <AppText style={[styles.classBannerText, { color: colors.muted }]}>
          {subjects.length} Subjects
        </AppText>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : subjects.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📚</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No subjects yet</AppText>
          </View>
        ) : (
          <View style={styles.grid}>
            {subjects.map((sub) => (
              <Pressable
                key={sub.id}
                 onPress={() => navigation.navigate("YouTubeChapters", {
                   subject: sub.id,
                   classLevel: sub.class_level,
                 })}
                style={({ pressed }) => [
                  styles.subjectCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: sub.color + "20" }]}>
                  <AppText style={styles.subjectIcon}>{sub.icon}</AppText>
                </View>
                <AppText style={[styles.subjectName, { color: colors.text }]} numberOfLines={2}>
                  {sub.name}
                </AppText>
                <AppText style={[styles.chapterCount, { color: colors.muted }]}>
                  {sub.chapters_count} chapters
                </AppText>
                <View style={[styles.goBtn, { backgroundColor: sub.color }]}>
                  <AppText style={styles.goBtnText}>▶</AppText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  classBanner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  classPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  classPillText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  classBannerText: { fontSize: 12 },
  scroll: { padding: 12, paddingBottom: 32 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  subjectCard: { width: "47%", padding: 14, borderWidth: 1, alignItems: "center", gap: 8 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  subjectIcon: { fontSize: 26 },
  subjectName: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  chapterCount: { fontSize: 11 },
  goBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  goBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
});
