import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { youtubeChaptersApi, youtubeVideosApi } from "@/services/resources";
import type { YouTubeChapter } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminYouTubeChapters">;
type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminYouTubeChaptersScreen({ route }: Props) {
  const { subjectId, subjectName } = route.params;
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [chapters, setChapters] = useState<YouTubeChapter[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await youtubeChaptersApi.list({ subject: subjectId });
      setChapters(res.results);
    } catch { Alert.alert("Error", "Could not load."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, [subjectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const deleteChapter = (ch: YouTubeChapter) => {
    Alert.alert("Delete", `Delete "${ch.title}" and all its videos?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await youtubeChaptersApi.update(String(ch.id), { is_active: false } as any);
          setChapters((p) => p.filter((c) => c.id !== ch.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  const deleteVideo = (chapterId: number, videoId: number) => {
    Alert.alert("Delete Video", "Delete this video?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await youtubeVideosApi.update(String(videoId), { is_active: false } as any);
          setChapters((prev) => prev.map((ch) => ch.id === chapterId
            ? { ...ch, videos: (ch.videos ?? []).filter((v) => v.id !== videoId) } : ch));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>📋 {subjectName}</AppText>
          <AppText style={[styles.headerSub, { color: colors.muted }]}>{chapters.length} chapters</AppText>
        </View>
        <Pressable onPress={() => navigation.navigate("AdminYouTubeChapterForm", { subjectId, id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Chapter</AppText>
        </Pressable>
      </View>

      <FlatList data={chapters} keyExtractor={(c) => String(c.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item: ch }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Pressable onPress={() => setExpanded(expanded === ch.id ? null : ch.id)} style={styles.chapterHeader}>
              <AppText style={[styles.chapterTitle, { color: colors.text }]}>{ch.title}</AppText>
              <AppText style={[styles.videoCount, { color: colors.muted }]}>{(ch.videos ?? []).length} videos</AppText>
              <Pressable onPress={() => navigation.navigate("AdminYouTubeChapterForm", { subjectId, id: ch.id })}
                style={[styles.smallBtn, { backgroundColor: brand.primary + "15", borderRadius: 6 }]}>
                <AppText style={[{ color: brand.primary, fontSize: 11, fontWeight: "700" }]}>✏️</AppText>
              </Pressable>
              <Pressable onPress={() => deleteChapter(ch)}
                style={[styles.smallBtn, { backgroundColor: "#EF444415", borderRadius: 6 }]}>
                <AppText style={[{ color: "#EF4444", fontSize: 11, fontWeight: "700" }]}>🗑️</AppText>
              </Pressable>
              <AppText style={[{ color: colors.muted, fontSize: 12 }]}>{expanded === ch.id ? "▲" : "▼"}</AppText>
            </Pressable>

            {expanded === ch.id && (
              <>
                {(ch.videos ?? []).map((video, idx) => (
                  <View key={video.id} style={[styles.videoRow, { borderTopColor: colors.border }]}>
                    <View style={[styles.playBadge, { backgroundColor: "#FF000020" }]}><AppText style={{ color: "#FF0000", fontSize: 10 }}>▶</AppText></View>
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.videoTitle, { color: colors.text }]} numberOfLines={1}>{video.title}</AppText>
                      <AppText style={[styles.videoMeta, { color: colors.muted }]}>ID: {video.video_id} {video.duration ? `· ${video.duration}` : ""}</AppText>
                    </View>
                    <Pressable onPress={() => navigation.navigate("AdminYouTubeVideoForm", { chapterId: ch.id, id: video.id })}
                      style={[styles.smallBtn, { backgroundColor: brand.primary + "15", borderRadius: 6 }]}>
                      <AppText style={{ color: brand.primary, fontSize: 11, fontWeight: "700" }}>✏️</AppText>
                    </Pressable>
                    <Pressable onPress={() => deleteVideo(ch.id, video.id)}
                      style={[styles.smallBtn, { backgroundColor: "#EF444415", borderRadius: 6 }]}>
                      <AppText style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>🗑️</AppText>
                    </Pressable>
                  </View>
                ))}
                <Pressable onPress={() => navigation.navigate("AdminYouTubeVideoForm", { chapterId: ch.id, id: null })}
                  style={[styles.addVideoBtn, { borderColor: brand.primary, borderRadius: radius.md }]}>
                  <AppText style={[{ color: brand.primary, fontWeight: "700", fontSize: 13 }]}>+ Add Video</AppText>
                </Pressable>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>📋</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No chapters yet</AppText></View>}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: "800" }, headerSub: { fontSize: 11, marginTop: 1 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8 }, addBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  list: { padding: 12, gap: 10, paddingBottom: 32 }, card: { borderWidth: 1, overflow: "hidden" },
  chapterHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  chapterTitle: { flex: 1, fontSize: 13, fontWeight: "700" }, videoCount: { fontSize: 11 },
  smallBtn: { paddingHorizontal: 7, paddingVertical: 4 },
  videoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  playBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  videoTitle: { fontSize: 12, fontWeight: "600" }, videoMeta: { fontSize: 10, marginTop: 1 },
  addVideoBtn: { margin: 10, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderStyle: "dashed" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
