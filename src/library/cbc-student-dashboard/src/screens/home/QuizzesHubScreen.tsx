import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import { useStudentClassStore } from "@/store/studentClassStore";
import { quizzesApi } from "@/services/resources";
import type { Quiz } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "QuizzesHub">;

// Store → display class level mapping
const CLASS_MAP: Record<string, string> = {
  "CLASS 9th":  "Class 9",
  "CLASS 10th": "Class 10",
  "CLASS 11th": "Class 11",
  "CLASS 12th": "Class 12",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  questions: number;
  duration: string;   // e.g. "20 mins"
  difficulty: "Easy" | "Medium" | "Hard";
  free: boolean;
  attempts: number;
}

const QUIZZES: QuizItem[] = [
  // FREE
  { id: "q1",  title: "Real Numbers Quick Test",           subject: "Mathematics", classLevel: "Class 10", questions: 10, duration: "15 mins", difficulty: "Easy",   free: true,  attempts: 1240 },
  { id: "q2",  title: "Chemical Reactions MCQ",            subject: "Science",     classLevel: "Class 10", questions: 15, duration: "20 mins", difficulty: "Medium", free: true,  attempts: 980  },
  { id: "q3",  title: "Newton's Laws Quiz",                subject: "Physics",     classLevel: "Class 12", questions: 10, duration: "15 mins", difficulty: "Easy",   free: true,  attempts: 756  },
  { id: "q4",  title: "Polynomials Practice",              subject: "Mathematics", classLevel: "Class 10", questions: 12, duration: "18 mins", difficulty: "Medium", free: true,  attempts: 1100 },
  { id: "q5",  title: "Periodic Table Basics",             subject: "Chemistry",   classLevel: "Class 11", questions: 10, duration: "12 mins", difficulty: "Easy",   free: true,  attempts: 890  },
  { id: "q6",  title: "Life Processes MCQ",                subject: "Biology",     classLevel: "Class 10", questions: 15, duration: "20 mins", difficulty: "Medium", free: true,  attempts: 670  },
  // PAID
  { id: "p1",  title: "Class 10 Maths Full Mock Test",     subject: "Mathematics", classLevel: "Class 10", questions: 40, duration: "90 mins", difficulty: "Hard",   free: false, attempts: 3200 },
  { id: "p2",  title: "Class 10 Science Full Mock Test",   subject: "Science",     classLevel: "Class 10", questions: 40, duration: "90 mins", difficulty: "Hard",   free: false, attempts: 2800 },
  { id: "p3",  title: "Class 12 Physics Full Mock Test",   subject: "Physics",     classLevel: "Class 12", questions: 35, duration: "75 mins", difficulty: "Hard",   free: false, attempts: 2100 },
  { id: "p4",  title: "Class 12 Chemistry Full Mock Test", subject: "Chemistry",   classLevel: "Class 12", questions: 35, duration: "75 mins", difficulty: "Hard",   free: false, attempts: 1900 },
  { id: "p5",  title: "Class 12 Maths Full Mock Test",     subject: "Mathematics", classLevel: "Class 12", questions: 40, duration: "90 mins", difficulty: "Hard",   free: false, attempts: 2300 },
  { id: "p6",  title: "UP Board Model Test — Class 10",    subject: "All Subjects",classLevel: "Class 10", questions: 50, duration: "120 mins",difficulty: "Hard",   free: false, attempts: 1500 },
  { id: "p7",  title: "CHIRAG Batch Monthly Test",         subject: "Mathematics", classLevel: "Class 9",  questions: 30, duration: "60 mins", difficulty: "Medium", free: false, attempts: 800  },
  { id: "p8",  title: "SHAKTI Batch Chapter Test",         subject: "Science",     classLevel: "Class 10", questions: 25, duration: "45 mins", difficulty: "Medium", free: false, attempts: 1200 },
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#2E90FA",
  Science:     "#12B76A",
  Physics:     "#F79009",
  Chemistry:   "#7A5AF8",
  Biology:     "#EF4444",
  English:     "#0EA5E9",
  "All Subjects": "#1B2B4B",
};

const DIFF_COLORS: Record<string, string> = {
  Easy:   "#12B76A",
  Medium: "#F79009",
  Hard:   "#EF4444",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuizzesHubScreen({ navigation }: Props) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const currentClassLevel = CLASS_MAP[selectedClass] ?? "Class 10";

  const [apiQuizzes, setApiQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuizzes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await quizzesApi.list({
        class_level: currentClassLevel,
        is_published: true,
        ordering: "sort_order",
      } as any);

      if (res.results && res.results.length > 0) {
        const mapped: QuizItem[] = res.results.map((q, idx) => ({
          id: String(q.id),
          title: q.title,
          subject: q.subject || "Mathematics",
          classLevel: q.class_level || currentClassLevel,
          questions: q.questions?.length ?? q.questions_count ?? 10,
          duration: q.time_limit_seconds
            ? `${Math.round(q.time_limit_seconds / 60)} mins`
            : "10 mins",
          difficulty: (q.difficulty as any) || "Easy",
          free: q.is_free !== false,
          attempts: 850 + idx * 120,
        }));
        setApiQuizzes(mapped);
      } else {
        setApiQuizzes([]);
      }
    } catch {
      // Fallback to static if offline
      setApiQuizzes([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentClassLevel]);

  useFocusEffect(
    useCallback(() => {
      fetchQuizzes();
    }, [fetchQuizzes])
  );

  // Combine dynamic quizzes with fallback static quizzes
  const allQuizzes = apiQuizzes.length > 0 ? apiQuizzes : QUIZZES;

  const filtered = allQuizzes.filter(
    (q) => q.free === (activeTab === "free") && q.classLevel === currentClassLevel
  );

  const handleQuizPress = (quiz: QuizItem) => {
    if (!quiz.free) return;
    navigation.navigate("QuizDetail", { quizId: quiz.id });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>🧠 Quizzes</AppText>
        <AppText style={[styles.headerSub, { color: colors.muted }]}>
          {currentClassLevel} · Test your knowledge with MCQs
        </AppText>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["free", "paid"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { borderBottomColor: brand.primary, borderBottomWidth: 2.5 }]}
          >
            <AppText style={[styles.tabText, { color: activeTab === tab ? brand.primary : colors.muted }]}>
              {tab === "free" ? "🆓 Free Quizzes" : "🔒 Premium Quizzes"}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Stats row */}
      <View style={[styles.statsRow, { backgroundColor: isDark ? "#1a2236" : "#F0F4FF" }]}>
        <View style={styles.stat}>
          <AppText style={[styles.statNum, { color: brand.primary }]}>
            {filtered.length}
          </AppText>
          <AppText style={[styles.statLabel, { color: colors.muted }]}>Quizzes</AppText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <AppText style={[styles.statNum, { color: brand.primary }]}>
            {filtered.reduce((a, q) => a + q.questions, 0)}
          </AppText>
          <AppText style={[styles.statLabel, { color: colors.muted }]}>Questions</AppText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <AppText style={[styles.statNum, { color: brand.primary }]}>
            {(filtered.reduce((a, q) => a + q.attempts, 0) / 1000).toFixed(1)}K
          </AppText>
          <AppText style={[styles.statLabel, { color: colors.muted }]}>Attempts</AppText>
        </View>
      </View>

      {activeTab === "paid" && (
        <View style={[styles.lockBanner, { backgroundColor: isDark ? "#1a2236" : "#FFF8F0", borderColor: "#F79009" }]}>
          <AppText style={{ color: "#F79009", fontSize: 13, lineHeight: 19 }}>
            🔒 Premium quizzes are unlocked when you enroll in a paid batch. Enroll in CHIRAG, SHAKTI or any paid course to access all mock tests.
          </AppText>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchQuizzes(true)}
            tintColor={brand.primary}
          />
        }
      >
        {filtered.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: isDark ? "#1a2236" : "#F8F9FF", borderColor: colors.border }]}>
            <AppText style={{ fontSize: 36, marginBottom: 8 }}>🧠</AppText>
            <AppText style={{ fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center" }}>
              No {activeTab} quizzes for {currentClassLevel}
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.muted, marginTop: 6, textAlign: "center" }}>
              More quizzes coming soon!
            </AppText>
          </View>
        )}
        {filtered.map((quiz) => {
          const subColor = SUBJECT_COLORS[quiz.subject] ?? "#667085";
          const diffColor = DIFF_COLORS[quiz.difficulty];
          return (
            <Pressable
              key={quiz.id}
              onPress={() => handleQuizPress(quiz)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  opacity: pressed && quiz.free ? 0.85 : 1,
                },
              ]}
            >
              {/* Top row */}
              <View style={styles.cardTop}>
                {/* Subject badge */}
                <View style={[styles.subjectBadge, { backgroundColor: subColor + "20" }]}>
                  <AppText style={[styles.subjectText, { color: subColor }]}>{quiz.subject}</AppText>
                </View>
                {/* Class badge */}
                <View style={[styles.classBadge, { backgroundColor: isDark ? "#253047" : "#F0F4FF" }]}>
                  <AppText style={[styles.classText, { color: colors.muted }]}>{quiz.classLevel}</AppText>
                </View>
                {/* Difficulty */}
                <View style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}>
                  <AppText style={[styles.diffText, { color: diffColor }]}>{quiz.difficulty}</AppText>
                </View>
              </View>

              {/* Title */}
              <AppText style={[styles.quizTitle, { color: colors.text }]} numberOfLines={2}>
                {quiz.title}
              </AppText>

              {/* Meta */}
              <View style={styles.metaRow}>
                <AppText style={[styles.metaText, { color: colors.muted }]}>❓ {quiz.questions} Qs</AppText>
                <AppText style={[styles.metaText, { color: colors.muted }]}>⏱ {quiz.duration}</AppText>
                <AppText style={[styles.metaText, { color: colors.muted }]}>👥 {quiz.attempts.toLocaleString()} attempts</AppText>
              </View>

              {/* Action */}
              <View style={styles.cardAction}>
                {quiz.free ? (
                  <View style={[styles.startBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
                    <AppText style={styles.startBtnText}>Start Quiz →</AppText>
                  </View>
                ) : (
                  <View style={[styles.lockRow, { backgroundColor: isDark ? "#2D1A00" : "#FFF3E0", borderRadius: radius.md }]}>
                    <AppText style={styles.lockIcon}>🔒</AppText>
                    <AppText style={{ color: "#F79009", fontWeight: "700", fontSize: 13 }}>Enroll to Unlock</AppText>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },

  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: "700" },

  statsRow: { flexDirection: "row", paddingVertical: 12 },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },

  lockBanner: { margin: 12, padding: 12, borderRadius: 10, borderWidth: 1 },

  list: { padding: 12, gap: 12, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 14 },
  cardTop: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  subjectBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  subjectText: { fontSize: 11, fontWeight: "700" },
  classBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  classText: { fontSize: 11, fontWeight: "600" },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 11, fontWeight: "700" },
  quizTitle: { fontSize: 15, fontWeight: "700", lineHeight: 21, marginBottom: 8 },
  metaRow: { flexDirection: "row", gap: 14, marginBottom: 12 },
  metaText: { fontSize: 11 },
  cardAction: {},
  startBtn: { paddingVertical: 12, alignItems: "center" },
  startBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  lockRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, gap: 8 },
  lockIcon: { fontSize: 18 },
  emptyBox: { borderWidth: 1, borderRadius: 16, padding: 32, alignItems: "center", marginTop: 20 },
});
