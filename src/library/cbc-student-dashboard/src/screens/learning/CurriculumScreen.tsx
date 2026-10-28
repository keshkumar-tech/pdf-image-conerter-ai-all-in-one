import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { coursesApi, modulesApi, progressApi, resourcesApi, quizzesApi, videosApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { Course, Lesson, LessonProgress, Module } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Curriculum">;

// Lesson type icons
const LESSON_ICONS: Record<string, string> = {
  video: "🎥",
  pdf: "📄",
  source_code: "💻",
  template: "📁",
  quiz: "📝",
  assignment: "✏️",
  project: "🚀",
};

export default function CurriculumScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      coursesApi.retrieve(courseId),
      modulesApi.curriculum(courseId),
      progressApi.list().catch(() => ({ results: [] as LessonProgress[] })),
    ])
      .then(([courseData, modulesData, progressData]) => {
        setCourse(courseData);
        setModules(modulesData);
        setProgress(progressData.results ?? []);
      })
      .catch(() => setError("Couldn't load curriculum."))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isLessonCompleted = (lessonId: string) =>
    progress.some((p) => p.lesson === lessonId && p.is_completed);

  const openLesson = async (lesson: Lesson) => {
    switch (lesson.lesson_type) {
      case "video": {
        try {
          const videoRes = await apiClient.get("/videos/", { params: { lesson: lesson.id } });
          const video = videoRes.data?.results?.[0];
          if (video) {
            const playback = await videosApi.playback(video.id);
            const ytUrl: string = playback.youtube_url || "";
            const m = ytUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
            if ((playback.provider === "youtube" || ytUrl) && m?.[1]) {
              navigation.navigate("YouTubePlayer", { videoId: m[1], title: lesson.title });
            } else {
              navigation.navigate("VideoPlayer", { lessonId: lesson.id, videoId: video.id });
            }
          } else {
            navigation.navigate("VideoPlayer", { lessonId: lesson.id, videoId: lesson.id });
          }
        } catch {
          navigation.navigate("VideoPlayer", { lessonId: lesson.id, videoId: lesson.id });
        }
        break;
      }
      case "pdf":
      case "source_code":
      case "template":
        navigation.navigate("LessonResources", { lessonId: lesson.id });
        break;
      case "quiz":
        try {
          const quizData = await quizzesApi.list({ lesson: lesson.id } as any) as any;
          const quiz = quizData.results?.[0];
          if (quiz) navigation.navigate("QuizDetail", { quizId: quiz.id });
        } catch {
          // fall through
        }
        break;
      case "assignment":
        navigation.navigate("Assignment", { assignmentId: lesson.id });
        break;
      case "project":
        navigation.navigate("Project", { projectId: lesson.id });
        break;
      default:
        navigation.navigate("LessonResources", { lessonId: lesson.id });
    }
  };

  // Calculate progress stats
  const allLessons = modules.flatMap((m) => m.lessons ?? []);
  const completedCount = allLessons.filter((l) => isLessonCompleted(l.id)).length;
  const progressPercent = allLessons.length > 0
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading curriculum..." />
    </SafeAreaView>
  );

  if (error || !course) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ErrorState message={error ?? "Not found."} onRetry={load} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => (activeModule ? setActiveModule(null) : navigation.goBack())}
          hitSlop={10}
          style={styles.backBtn}
        >
          <AppText style={[styles.backIcon, { color: colors.text }]}>←</AppText>
        </Pressable>
        <View style={styles.headerMid}>
          <AppText style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {activeModule ? activeModule.title : (course.batch_name || course.title)}
          </AppText>
          {course.instructor_name ? (
            <AppText style={[styles.headerSub, { color: colors.muted }]}>
              by {course.instructor_name}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* Progress bar */}
      {allLessons.length > 0 && (
        <View style={[styles.progressSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.progressRow}>
            <AppText style={[styles.progressText, { color: colors.text }]}>
              {completedCount}/{allLessons.length} lessons completed
            </AppText>
            <AppText style={[styles.progressPct, { color: brand.primary }]}>
              {progressPercent}%
            </AppText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: brand.primary, width: `${progressPercent}%` as any }]} />
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {activeModule ? (
          /* ── LEVEL 2: chapters/videos of selected subject (YouTube style) ── */
          <View style={{ padding: 12, gap: 12 }}>
            <View style={[styles.subjectHero, { backgroundColor: brand.primary, borderRadius: radius.lg }]}>
              <AppText style={styles.subjectHeroIcon}>📚</AppText>
              <View style={{ flex: 1 }}>
                <AppText style={styles.subjectHeroName}>{activeModule.title}</AppText>
                <AppText style={styles.subjectHeroMeta}>
                  {(activeModule.lessons ?? []).length} chapters · {course.batch_name || course.title}
                </AppText>
              </View>
            </View>

            {(activeModule.lessons ?? []).length === 0 ? (
              <View style={styles.empty}>
                <AppText style={{ fontSize: 32, marginBottom: 8 }}>🎬</AppText>
                <AppText style={[styles.emptyText, { color: colors.text }]}>No videos yet</AppText>
                <AppText style={[styles.emptySubText, { color: colors.muted }]}>Videos coming soon!</AppText>
              </View>
            ) : (
              (activeModule.lessons ?? []).map((lesson) => {
                const completed = isLessonCompleted(lesson.id);
                const isVideo = lesson.lesson_type === "video";
                return (
                  <Pressable
                    key={lesson.id}
                    onPress={() => openLesson(lesson)}
                    style={({ pressed }) => [
                      styles.videoRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.playBtn, { backgroundColor: isVideo ? "#FF0000" : brand.primary, borderRadius: radius.md }]}>
                      <AppText style={styles.playIcon}>{isVideo ? "▶" : "📄"}</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                        {lesson.title}
                      </AppText>
                      <View style={styles.lessonMetaRow}>
                        {lesson.duration_minutes > 0 && (
                          <AppText style={[styles.duration, { color: colors.muted }]}>⏱ {lesson.duration_minutes}m</AppText>
                        )}
                        {lesson.is_free_preview && (
                          <View style={[styles.freeBadge, { backgroundColor: "#12B76A18" }]}>
                            <AppText style={styles.freeText}>FREE</AppText>
                          </View>
                        )}
                        {completed && (
                          <View style={[styles.freeBadge, { backgroundColor: "#12B76A18" }]}>
                            <AppText style={[styles.freeText, { color: "#12B76A" }]}>✓ DONE</AppText>
                          </View>
                        )}
                      </View>
                    </View>
                    <AppText style={[styles.arrow, { color: colors.muted }]}>›</AppText>
                  </Pressable>
                );
              })
            )}
          </View>
        ) : (
          /* ── LEVEL 1: subject grid (YouTube style) ── */
          modules.length === 0 ? (
            <View style={styles.empty}>
              <AppText style={{ fontSize: 32, marginBottom: 8 }}>📚</AppText>
              <AppText style={[styles.emptyText, { color: colors.text }]}>No content yet</AppText>
              <AppText style={[styles.emptySubText, { color: colors.muted }]}>
                The instructor is preparing course content. Check back soon!
              </AppText>
            </View>
          ) : (
            <View style={styles.subjectGrid}>
              {modules.map((mod) => {
                const lessons = mod.lessons ?? [];
                const modDone = lessons.filter((l) => isLessonCompleted(l.id)).length;
                return (
                  <Pressable
                    key={mod.id}
                    onPress={() => setActiveModule(mod)}
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
                    <View style={[styles.subjectIconCircle, { backgroundColor: brand.primary + "20" }]}>
                      <AppText style={styles.subjectIconEmoji}>📘</AppText>
                    </View>
                    <AppText style={[styles.subjectCardName, { color: colors.text }]} numberOfLines={2}>
                      {mod.title}
                    </AppText>
                    <AppText style={[styles.subjectCardMeta, { color: colors.muted }]}>
                      {lessons.length} chapters · {modDone} done
                    </AppText>
                    <View style={[styles.subjectGoBtn, { backgroundColor: brand.primary, borderRadius: 20 }]}>
                      <AppText style={styles.subjectGoBtnText}>▶</AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22 },
  headerMid: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 1 },

  progressSection: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressText: { fontSize: 12 },
  progressPct: { fontSize: 12, fontWeight: "700" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },

  empty: { alignItems: "center", padding: 48 },
  emptyText: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  emptySubText: { fontSize: 13, textAlign: "center", marginTop: 6 },
  // ── YouTube-style subject grid ──
  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 12 },
  subjectCard: {
    width: "47%",
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  subjectIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  subjectIconEmoji: { fontSize: 26 },
  subjectCardName: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  subjectCardMeta: { fontSize: 11 },
  subjectGoBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  subjectGoBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  // ── Subject hero + video rows (chapter level) ──
  subjectHero: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  subjectHeroIcon: { fontSize: 32 },
  subjectHeroName: { color: "#fff", fontSize: 16, fontWeight: "800" },
  subjectHeroMeta: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  playBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  playIcon: { color: "#fff", fontSize: 16, fontWeight: "800" },
  videoTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },

  moduleBlock: { borderBottomWidth: 1 },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  moduleNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moduleNumText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  moduleMid: { flex: 1 },
  moduleTitle: { fontSize: 14, fontWeight: "700", lineHeight: 19 },
  moduleMeta: { fontSize: 11, marginTop: 2 },
  chevron: { fontSize: 12 },

  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 13, fontWeight: "600", lineHeight: 18, marginBottom: 4 },
  lessonMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 9, fontWeight: "800" },
  duration: { fontSize: 11 },
  freeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  freeText: { color: "#12B76A", fontSize: 9, fontWeight: "800" },
  arrow: { fontSize: 22 },
});
