import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminModuleLessons">;

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  order: number;
  duration_minutes: number | null;
  is_free_preview: boolean;
  video?: { youtube_url?: string; provider?: string; playback_url?: string } | null;
}

/** Add / manage videos (chapters) inside a module — YouTube playlist style. */
export default function AdminModuleLessonsScreen({ route, navigation }: Props) {
  const { courseId, moduleId, moduleTitle } = route.params;
  const { colors, brand, radius } = useTheme();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string } | null>(null);
  const [duration, setDuration] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);
      try {
        const res = await apiClient.get(`/courses/lessons/`, {
          params: { module: moduleId },
        });
        const rows: Lesson[] = [...(res.data?.results ?? res.data ?? [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
        setLessons(rows);
        if (!isRefresh) {
          // Also load the video record for each lesson so we can show source badge
          setTimeout(async () => {
            try {
              const enriched = await Promise.all(rows.map(async (l) => {
                if (l.lesson_type !== "video") return l;
                const vRes = await apiClient.get("/videos/", { params: { lesson: l.id } });
                const v = vRes.data?.results?.[0];
                return { ...l, video: v ? { provider: v.provider, youtube_url: v.youtube_url, playback_url: v.playback_url } : null };
              }));
              setLessons(enriched);
            } catch { /* badge is optional */ }
          }, 0);
        }
      } catch {
        Alert.alert("Error", "Could not load lessons.");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [moduleId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pickVideo = async () => {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({
        type: ["video/mp4", "video/quicktime", "video/x-matroska", "video/*"],
        copyToCacheDirectory: true,
      });
      if (res?.canceled) return;
      const asset = res?.assets?.[0] ?? res;
      if (asset?.uri) setPickedFile({ uri: asset.uri, name: asset.name ?? "video.mp4" });
    } catch {
      Alert.alert("Error", "Could not pick video.");
    }
  };

  const addLesson = async () => {
    if (!title.trim()) {
      Alert.alert("Missing info", "Enter a chapter title.");
      return;
    }
    if (source === "youtube" && !youtubeUrl.trim()) {
      Alert.alert("Missing info", "Enter the YouTube video link.");
      return;
    }
    if (source === "upload" && !pickedFile) {
      Alert.alert("Missing info", "Choose a video file from your phone.");
      return;
    }
    setSaving(true);
    try {
      const lessonRes = await apiClient.post("/courses/lessons/", {
        module: moduleId,
        title: title.trim(),
        lesson_type: "video",
        order: lessons.length + 1,
        duration_minutes: duration ? Number(duration) : null,
        is_free_preview: isFreePreview,
      });
      const lesson = lessonRes.data;
      if (lesson && lesson.id) {
        if (source === "youtube") {
          await apiClient.post("/videos/", {
            lesson: lesson.id,
            provider: "youtube",
            youtube_url: youtubeUrl.trim(),
            is_protected: false,
          });
        } else if (pickedFile) {
          // Upload own video (mp4) — not on YouTube
          const fd = new FormData();
          fd.append("lesson", lesson.id);
          fd.append("provider", "self");
          fd.append("is_protected", "true");
          // @ts-ignore RN FormData file shape
          fd.append("video_file", { uri: pickedFile.uri, name: pickedFile.name, type: "video/mp4" });
          await apiClient.post("/videos/", fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
      }
      setTitle("");
      setYoutubeUrl("");
      setPickedFile(null);
      setDuration("");
      setIsFreePreview(false);
      await load();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data
          ? JSON.stringify(e.response.data)
          : "Could not add chapter.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = (lesson: Lesson) => {
    Alert.alert("Delete chapter?", lesson.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/courses/lessons/${lesson.id}/`);
            await load();
          } catch {
            Alert.alert("Error", "Could not delete chapter.");
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    heading: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.surface,
      marginBottom: 10,
      fontSize: 14,
    },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    rowText: { flex: 1, fontSize: 14, color: colors.text },
    sourceRow: { flexDirection: "row", borderWidth: 1, padding: 3, marginBottom: 10, gap: 4 },
    sourceBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
    sourceText: { fontSize: 13, fontWeight: "700" },
    uploadBtn: { borderWidth: 1.5, borderStyle: "dashed", paddingVertical: 16, alignItems: "center", marginBottom: 10 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
    cardMeta: { fontSize: 12, color: colors.muted },
    sourceBadge: { fontSize: 12, fontWeight: "700" },
    freeBadge: { fontSize: 11, color: brand.primary, fontWeight: "700" },
    delete: { paddingHorizontal: 8, paddingVertical: 4 },
    deleteText: { color: "#e11d48", fontWeight: "700" },
    saveBtn: {
      backgroundColor: brand.primary,
      borderRadius: radius.md,
      paddingVertical: 13,
      alignItems: "center",
      marginTop: 4,
    },
    saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    saveBtnDisabled: { opacity: 0.6 },
  });

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.content}>
            <AppText style={styles.heading}>
              Chapters in "{moduleTitle}"
            </AppText>

            <TextInput
              style={styles.input}
              placeholder="Chapter title"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />

            {/* ── Source chooser: YouTube Link OR Upload Own Video ── */}
            <View style={[styles.sourceRow, { backgroundColor: colors.background, borderRadius: radius.md, borderColor: colors.border }]}>
              <Pressable
                onPress={() => { setSource("youtube"); setPickedFile(null); }}
                style={[styles.sourceBtn, { borderRadius: radius.sm }, source === "youtube" && { backgroundColor: brand.primary }]}
              >
                <AppText style={[styles.sourceText, { color: source === "youtube" ? "#fff" : colors.muted }]}>▶️ YouTube Link</AppText>
              </Pressable>
              <Pressable
                onPress={() => { setSource("upload"); setYoutubeUrl(""); }}
                style={[styles.sourceBtn, { borderRadius: radius.sm }, source === "upload" && { backgroundColor: brand.primary }]}
              >
                <AppText style={[styles.sourceText, { color: source === "upload" ? "#fff" : colors.muted }]}>📤 Upload My Video</AppText>
              </Pressable>
            </View>

            {source === "youtube" ? (
              <TextInput
                style={styles.input}
                placeholder="YouTube video link"
                placeholderTextColor={colors.muted}
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            ) : (
              <Pressable onPress={pickVideo} style={[styles.uploadBtn, { borderColor: brand.primary, borderRadius: radius.md, backgroundColor: brand.primary + "12" }]}>
                <AppText style={{ color: brand.primary, fontWeight: "700", fontSize: 13, textAlign: "center" }}>
                  {pickedFile
                    ? `🎬 ${pickedFile.name}`
                    : "📤 Choose Video (mp4) from Phone"}
                </AppText>
              </Pressable>
            )}
            <TextInput
              style={styles.input}
              placeholder="Duration in minutes (optional)"
              placeholderTextColor={colors.muted}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />
            <View style={styles.row}>
              <Switch value={isFreePreview} onValueChange={setIsFreePreview} />
              <AppText style={styles.rowText}>
                {" "}
                Free preview (watchable without purchase)
              </AppText>
            </View>
            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={addLesson}
              disabled={saving}
            >
              <AppText style={styles.saveBtnText}>
                {saving
                  ? "Adding..."
                  : source === "youtube"
                    ? "+ Add Chapter (YouTube)"
                    : "+ Add Chapter (My Video)"}
              </AppText>
            </Pressable>

            <AppText style={[styles.heading, { marginTop: 20 }]}>
              {lessons.length} chapter{lessons.length === 1 ? "" : "s"}
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.cardTitle}>{item.title}</AppText>
              <AppText style={styles.cardMeta}>
                #{item.order} ·{" "}
                {item.duration_minutes
                  ? `${item.duration_minutes} min`
                  : "video"}
                {item.video && (
                  <AppText style={[styles.sourceBadge, { color: item.video.provider === "youtube" ? "#FF0000" : brand.primary }]}>
                    {"  · "}{item.video.provider === "youtube" ? "▶️ YouTube" : "📤 My Video"}
                  </AppText>
                )}
              </AppText>
            </View>
            <Pressable
              style={styles.delete}
              onPress={() => removeLesson(item)}
              hitSlop={8}
            >
              <AppText style={styles.deleteText}>Delete</AppText>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <AppText
              style={{ textAlign: "center", color: colors.muted, padding: 24 }}
            >
              No chapters yet. Add the first one above.
            </AppText>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}
