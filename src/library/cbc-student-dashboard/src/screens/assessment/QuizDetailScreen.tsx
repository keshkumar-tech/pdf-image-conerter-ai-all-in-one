import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { quizzesApi } from "@/services/resources";
import type { Quiz } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "QuizDetail">;

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#2E90FA",
  Science: "#12B76A",
  English: "#F79009",
  Hindi: "#EF4444",
  "Social Science": "#8B5CF6",
  Physics: "#F79009",
  Chemistry: "#7A5AF8",
  Biology: "#12B76A",
};

export default function QuizDetailScreen({ route, navigation }: Props) {
  const { quizId } = route.params;
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizzesApi.retrieve(quizId);
      setQuiz(data);
    } catch {
      setError("Could not load quiz details. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={brand.primary} />
        <AppText style={{ marginTop: 12, color: colors.muted }}>
          Loading quiz details...
        </AppText>
      </SafeAreaView>
    );
  }

  if (error || !quiz) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
      >
        <ErrorState message={error ?? "Quiz not found"} onRetry={loadQuiz} />
      </SafeAreaView>
    );
  }

  const subject = quiz.subject || "Mathematics";
  const subjectColor = SUBJECT_COLORS[subject] || brand.primary;
  const totalQuestions = quiz.questions?.length ?? quiz.questions_count ?? 10;
  const marksPerQ = quiz.marks_per_question ?? 1;
  const totalMarks = quiz.total_marks ?? totalQuestions * marksPerQ;
  const durationMins = quiz.time_limit_seconds
    ? `${Math.round(quiz.time_limit_seconds / 60)} Mins`
    : "Untimed";
  const difficulty = quiz.difficulty || "Easy";

  const diffColor =
    difficulty === "Easy"
      ? "#12B76A"
      : difficulty === "Medium"
        ? "#F79009"
        : "#EF4444";

  const handleConfirmStart = () => {
    navigation.replace("Quiz", { quizId: quiz.id });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Badges Card */}
        <Card style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.subjectBadge,
                { backgroundColor: subjectColor + "20" },
              ]}
            >
              <AppText style={[styles.subjectText, { color: subjectColor }]}>
                {subject}
              </AppText>
            </View>
            <View
              style={[
                styles.subjectBadge,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <AppText style={[styles.classText, { color: colors.text }]}>
                {quiz.class_level || "Class 10"}
              </AppText>
            </View>
            <View
              style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}
            >
              <AppText style={[styles.diffText, { color: diffColor }]}>
                ● {difficulty}
              </AppText>
            </View>
          </View>

          <AppText variant="h2" style={[styles.title, { color: colors.text }]}>
            {quiz.title}
          </AppText>

          {quiz.topic ? (
            <View style={styles.topicRow}>
              <AppText style={[styles.topicLabel, { color: colors.muted }]}>
                📚 Syllabus / Topic:
              </AppText>
              <AppText style={[styles.topicValue, { color: colors.text }]}>
                {quiz.topic}
              </AppText>
            </View>
          ) : null}

          {quiz.description ? (
            <AppText style={[styles.description, { color: colors.muted }]}>
              {quiz.description}
            </AppText>
          ) : null}
        </Card>

        {/* 2x2 Stats Grid */}
        <View style={styles.grid}>
          <View
            style={[
              styles.gridItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppText style={styles.gridIcon}>⏱</AppText>
            <AppText style={[styles.gridValue, { color: colors.text }]}>
              {durationMins}
            </AppText>
            <AppText style={[styles.gridLabel, { color: colors.muted }]}>
              Time Limit
            </AppText>
          </View>

          <View
            style={[
              styles.gridItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppText style={styles.gridIcon}>❓</AppText>
            <AppText style={[styles.gridValue, { color: colors.text }]}>
              {totalQuestions}
            </AppText>
            <AppText style={[styles.gridLabel, { color: colors.muted }]}>
              Total MCQs
            </AppText>
          </View>

          <View
            style={[
              styles.gridItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppText style={styles.gridIcon}>🏆</AppText>
            <AppText style={[styles.gridValue, { color: colors.text }]}>
              {totalMarks} Marks
            </AppText>
            <AppText style={[styles.gridLabel, { color: colors.muted }]}>
              {marksPerQ} mark per question
            </AppText>
          </View>

          <View
            style={[
              styles.gridItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppText style={styles.gridIcon}>🎯</AppText>
            <AppText style={[styles.gridValue, { color: colors.text }]}>
              {quiz.passing_score_percent}%
            </AppText>
            <AppText style={[styles.gridLabel, { color: colors.muted }]}>
              Passing Score
            </AppText>
          </View>
        </View>

        {/* Instructions Card */}
        <Card style={styles.sectionCard}>
          <AppText
            variant="h3"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            📋 Quiz Instructions
          </AppText>
          <View style={styles.instructionsList}>
            {quiz.instructions ? (
              <AppText style={[styles.instructionText, { color: colors.text }]}>
                {quiz.instructions}
              </AppText>
            ) : (
              <>
                <View style={styles.instructionItem}>
                  <AppText style={styles.bullet}>•</AppText>
                  <AppText
                    style={[styles.instructionLine, { color: colors.text }]}
                  >
                    All {totalQuestions} questions are Multiple Choice Questions
                    (MCQ) with exactly 4 options.
                  </AppText>
                </View>
                <View style={styles.instructionItem}>
                  <AppText style={styles.bullet}>•</AppText>
                  <AppText
                    style={[styles.instructionLine, { color: colors.text }]}
                  >
                    Select 1 correct option and press "Submit Answer / Next
                    Question".
                  </AppText>
                </View>
                <View style={styles.instructionItem}>
                  <AppText style={styles.bullet}>•</AppText>
                  <AppText
                    style={[styles.instructionLine, { color: colors.text }]}
                  >
                    {quiz.allow_back_navigation
                      ? "You may navigate back to previous questions."
                      : "Back navigation is disabled — once submitted, answers cannot be edited."}
                  </AppText>
                </View>
                <View style={styles.instructionItem}>
                  <AppText style={styles.bullet}>•</AppText>
                  <AppText
                    style={[styles.instructionLine, { color: colors.text }]}
                  >
                    The timer starts immediately after clicking "Confirm & Start
                    Quiz".
                  </AppText>
                </View>
                <View style={styles.instructionItem}>
                  <AppText style={styles.bullet}>•</AppText>
                  <AppText
                    style={[styles.instructionLine, { color: colors.text }]}
                  >
                    Your final score, percentage, and detailed answers will be
                    shown upon completion.
                  </AppText>
                </View>
              </>
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Button
          label="Confirm & Start Quiz 🚀"
          onPress={handleConfirmStart}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scrollContent: { padding: 16, paddingBottom: 24, gap: 14 },
  mainCard: { padding: 18 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  subjectText: { fontSize: 12, fontWeight: "700" },
  classText: { fontSize: 12, fontWeight: "600" },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  diffText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 10, lineHeight: 28 },
  topicRow: { marginTop: 4, marginBottom: 8 },
  topicLabel: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  topicValue: { fontSize: 14, fontWeight: "700" },
  description: { fontSize: 13, lineHeight: 20, marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    flex: 1,
    minWidth: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  gridIcon: { fontSize: 22, marginBottom: 4 },
  gridValue: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  gridLabel: { fontSize: 11, textAlign: "center" },
  sectionCard: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  instructionsList: { gap: 8 },
  instructionItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: { fontSize: 16, color: "#F79009", lineHeight: 20 },
  instructionLine: { flex: 1, fontSize: 13, lineHeight: 20 },
  instructionText: { fontSize: 13, lineHeight: 22 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
