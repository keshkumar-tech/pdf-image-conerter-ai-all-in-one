import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { youtubeChaptersApi, youtubeSubjectsApi } from "@/services/resources";
import type { YouTubeChapter, YouTubeSubject } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "YouTubeChapters">;

export default function YouTubeChaptersScreen({ route, navigation }: Props) {
  const { subject: subjectId, classLevel } = route.params;
  const { colors, brand, radius } = useTheme();

  const [subjectInfo, setSubjectInfo] = useState<YouTubeSubject | null>(null);
  const [chapters, setChapters] = useState<YouTubeChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const sub = await youtubeSubjectsApi.retrieve(String(subjectId));
      setSubjectInfo(sub);

      if (sub) {
        const chapRes = await youtubeChaptersApi.list({ subject: sub.id, is_active: true });
        setChapters(chapRes.results);
      }
    } catch {
      setError("Could not load chapters.");
    } finally {
      setIsLoading(false); setRefreshing(false);
    }
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (subjectInfo) {
      navigation.setOptions({ title: `${subjectInfo.icon} ${subjectInfo.name}` });
    }
  }, [subjectInfo]);

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading chapters..." />
    </SafeAreaView>
  );

  const color = subjectInfo?.color ?? brand.primary;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Subject header */}
        {subjectInfo && (
          <View style={[styles.subjectCard, { backgroundColor: color, borderRadius: radius.lg }]}>
            <AppText style={styles.subjectIcon}>{subjectInfo.icon}</AppText>
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
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Videos coming soon!</AppText>
          </View>
        ) : (
          chapters.map((chapter) => (
            <View key={chapter.id} style={[styles.chapterCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
              {/* Chapter header */}
              <Pressable
                onPress={() => setExpanded(expanded === chapter.id ? null : chapter.id)}
                style={[styles.chapterHeader, { borderBottomColor: colors.border }]}
              >
                <View style={[styles.chapterNumBadge, { backgroundColor: color + "20" }]}>
                  <AppText style={[styles.chapterNum, { color }]}>Ch</AppText>
                </View>
                <AppText style={[styles.chapterTitle, { color: colors.text }]} numberOfLines={2}>
                  {chapter.title}
                </AppText>
                <AppText style={[styles.chapterCount, { color: colors.muted }]}>
                  {chapter.videos?.length ?? 0} videos
                </AppText>
                <AppText style={[styles.chevron, { color: colors.muted }]}>
                  {expanded === chapter.id ? "▲" : "▼"}
                </AppText>
              </Pressable>

              {/* Videos list */}
              {expanded === chapter.id && (chapter.videos ?? []).map((video, idx) => (
                <Pressable
                  key={video.id}
                  onPress={() => navigation.navigate("YouTubePlayer", { videoId: video.video_id, title: video.title })}
                  style={[styles.videoRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <View style={[styles.playBtn, { backgroundColor: color }]}>
                    <AppText style={styles.playIcon}>▶</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                      {video.title}
                    </AppText>
                    {!!video.duration && (
                      <AppText style={[styles.videoDuration, { color: colors.muted }]}>⏱ {video.duration}</AppText>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
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
  chapterHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 0 },
  chapterNumBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  chapterNum: { fontSize: 10, fontWeight: "800" },
  chapterTitle: { flex: 1, fontSize: 13, fontWeight: "700" },
  chapterCount: { fontSize: 11 },
  chevron: { fontSize: 12 },
  videoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  playBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  playIcon: { color: "#fff", fontSize: 12 },
  videoTitle: { fontSize: 13, fontWeight: "600" },
  videoDuration: { fontSize: 11, marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13 },
});
