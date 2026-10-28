import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { impQuestionChaptersApi, impQuestionsApi } from "@/services/resources";
import type { ImpQuestionChapter, ImpQuestionSubject } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ImpQuestionChapters">;

export default function ImpQuestionChaptersScreen({ route, navigation }: Props) {
  const { subject: subjectId, classLevel } = route.params;
  const { colors, brand, radius } = useTheme();

  const [subjectInfo, setSubjectInfo] = useState<ImpQuestionSubject | null>(null);
  const [chapters, setChapters] = useState<ImpQuestionChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const sub = await impQuestionsApi.retrieve(String(subjectId));
      setSubjectInfo(sub);

      if (sub) {
        const chapRes = await impQuestionChaptersApi.list({ subject: sub.id, is_active: true });
        setChapters(chapRes.results);
      }
    } catch {
      setError("Could not load chapters.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (subjectInfo) {
      navigation.setOptions({ title: `⭐ ${subjectInfo.name}` });
    }
  }, [subjectInfo, navigation]);

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading chapters..." />
    </SafeAreaView>
  );

  const color = "#EF4444";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {subjectInfo && (
          <View style={[styles.subjectCard, { backgroundColor: color, borderRadius: radius.lg }]}>
            <AppText style={styles.subjectIcon}>⭐</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={styles.subjectName}>{subjectInfo.name}</AppText>
              <AppText style={styles.subjectMeta}>{classLevel} · {chapters.length} chapters</AppText>
            </View>
          </View>
        )}

        {error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : chapters.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📚</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No chapters yet</AppText>
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Coming soon!</AppText>
          </View>
        ) : (
          chapters.map((chapter) => (
            <Pressable
              key={chapter.id}
              onPress={() => navigation.navigate("ImpQuestionPDFs", { chapter: chapter.id, subjectName: subjectInfo?.name })}
              style={[styles.chapterCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
            >
              <View style={styles.chapterHeader}>
                <View style={[styles.chapterNumBadge, { backgroundColor: color + "20" }]}>
                  <AppText style={[styles.chapterNum, { color }]}>Ch</AppText>
                </View>
                <AppText style={[styles.chapterTitle, { color: colors.text }]} numberOfLines={2}>
                  {chapter.title}
                </AppText>
                <View style={[styles.goBtn, { backgroundColor: color }]}>
                  <AppText style={styles.goBtnText}>→</AppText>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 12, gap: 12, paddingBottom: 32 },
  subjectCard: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, marginBottom: 4 },
  subjectIcon: { fontSize: 32 },
  subjectName: { color: "#fff", fontSize: 16, fontWeight: "800" },
  subjectMeta: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  chapterCard: { borderWidth: 1, overflow: "hidden" },
  chapterHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  chapterNumBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  chapterNum: { fontSize: 10, fontWeight: "800" },
  chapterTitle: { flex: 1, fontSize: 13, fontWeight: "700" },
  goBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  goBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13 },
});
