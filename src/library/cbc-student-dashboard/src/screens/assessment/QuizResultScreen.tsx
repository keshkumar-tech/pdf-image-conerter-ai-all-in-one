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
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { quizAttemptsApi } from "@/services/resources";
import type { QuizAttempt } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "QuizResult">;

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function QuizResultScreen({ route, navigation }: Props) {
  const { attemptId } = route.params;
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    quizAttemptsApi.retrieve(attemptId).then(setAttempt).catch(() => {});
  }, [attemptId]);

  if (!attempt) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <LoadingState label="Grading your quiz & preparing score card..." />
      </SafeAreaView>
    );
  }

  const passed = attempt.passed;
  const scorePercent = Math.round(Number(attempt.score_percent || 0));
  const totalQuestions = attempt.total_questions || attempt.review?.length || 10;
  const correctAnswers = attempt.correct_answers || 0;
  const incorrectAnswers = attempt.incorrect_answers || 0;
  const unattempted = attempt.unattempted_questions || 0;
  const score = attempt.score !== undefined ? attempt.score : correctAnswers;

  // Format Time Taken
  const formatTimeTaken = (sec?: number) => {
    if (!sec) return "< 1 min";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const handleRetake = () => {
    if (attempt.quiz) {
      navigation.replace("QuizDetail", { quizId: attempt.quiz });
    } else {
      navigation.popToTop();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Card: Status & Percentage */}
        <Card
          style={[
            styles.heroCard,
            {
              borderColor: passed ? "#12B76A" : "#EF4444",
              backgroundColor: passed
                ? isDark
                  ? "rgba(18, 183, 106, 0.12)"
                  : "rgba(18, 183, 106, 0.08)"
                : isDark
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(239, 68, 68, 0.08)",
            },
          ]}
        >
          <AppText style={styles.statusEmoji}>{passed ? "🎉" : "📘"}</AppText>
          <AppText
            variant="h1"
            style={[
              styles.percentageText,
              { color: passed ? "#12B76A" : "#EF4444" },
            ]}
          >
            {scorePercent}%
          </AppText>

          <View style={styles.badgeRow}>
            <Badge tone={passed ? "success" : "danger"}>
              {passed ? "Passed" : "Needs Improvement"}
            </Badge>
            {attempt.quiz_subject ? (
              <Badge tone="primary">{attempt.quiz_subject}</Badge>
            ) : null}
            {attempt.quiz_class_level ? (
              <Badge tone="neutral">{attempt.quiz_class_level}</Badge>
            ) : null}
          </View>

          {attempt.quiz_title ? (
            <AppText
              style={[styles.quizTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {attempt.quiz_title}
            </AppText>
          ) : null}

          <AppText style={[styles.passSub, { color: colors.muted }]}>
            {passed
              ? `Congratulations! You scored above the passing threshold of ${attempt.passing_score_percent || 40}%.`
              : `Passing requirement was ${attempt.passing_score_percent || 40}%. Review questions below and try again.`}
          </AppText>
        </Card>

        {/* 4 Stats Grid */}
        <View style={styles.grid}>
          {/* Total Questions */}
          <View
            style={[
              styles.gridCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <AppText style={styles.gridIcon}>❓</AppText>
            <AppText style={[styles.gridVal, { color: colors.text }]}>
              {totalQuestions}
            </AppText>
            <AppText style={[styles.gridLbl, { color: colors.muted }]}>
              Total Questions
            </AppText>
          </View>

          {/* Correct Answers */}
          <View
            style={[
              styles.gridCard,
              { backgroundColor: colors.surface, borderColor: "#12B76A40" },
            ]}
          >
            <AppText style={styles.gridIcon}>✅</AppText>
            <AppText style={[styles.gridVal, { color: "#12B76A" }]}>
              {correctAnswers}
            </AppText>
            <AppText style={[styles.gridLbl, { color: colors.muted }]}>
              Correct
            </AppText>
          </View>

          {/* Incorrect Answers */}
          <View
            style={[
              styles.gridCard,
              { backgroundColor: colors.surface, borderColor: "#EF444440" },
            ]}
          >
            <AppText style={styles.gridIcon}>❌</AppText>
            <AppText style={[styles.gridVal, { color: "#EF4444" }]}>
              {incorrectAnswers}
            </AppText>
            <AppText style={[styles.gridLbl, { color: colors.muted }]}>
              Incorrect
            </AppText>
          </View>

          {/* Unattempted */}
          <View
            style={[
              styles.gridCard,
              { backgroundColor: colors.surface, borderColor: "#F7900940" },
            ]}
          >
            <AppText style={styles.gridIcon}>⚪</AppText>
            <AppText style={[styles.gridVal, { color: "#F79009" }]}>
              {unattempted}
            </AppText>
            <AppText style={[styles.gridLbl, { color: colors.muted }]}>
              Unattempted
            </AppText>
          </View>
        </View>

        {/* Additional Details (Score & Time Taken) */}
        <Card style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <AppText style={[styles.detailItemLabel, { color: colors.muted }]}>
                Score Achieved
              </AppText>
              <AppText style={[styles.detailItemValue, { color: colors.text }]}>
                {score} Marks
              </AppText>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailItem}>
              <AppText style={[styles.detailItemLabel, { color: colors.muted }]}>
                Time Taken
              </AppText>
              <AppText style={[styles.detailItemValue, { color: colors.text }]}>
                {formatTimeTaken(attempt.time_taken_seconds)}
              </AppText>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailItem}>
              <AppText style={[styles.detailItemLabel, { color: colors.muted }]}>
                Accuracy
              </AppText>
              <AppText style={[styles.detailItemValue, { color: colors.text }]}>
                {totalQuestions > 0 ? `${Math.round((correctAnswers / totalQuestions) * 100)}%` : "0%"}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            label="Retake Quiz 🔄"
            variant="secondary"
            onPress={handleRetake}
            style={{ flex: 1 }}
          />
          <Button
            label="Done / Back 🏠"
            onPress={() => navigation.popToTop()}
            style={{ flex: 1 }}
          />
        </View>

        {/* Scalable Review Section Toggle */}
        {attempt.review && attempt.review.length > 0 ? (
          <View style={styles.reviewSection}>
            <Pressable
              onPress={() => setShowReview(!showReview)}
              style={[
                styles.reviewToggleBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.reviewToggleContent}>
                <AppText style={{ fontSize: 18 }}>💡</AppText>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.reviewToggleTitle, { color: colors.text }]}>
                    {showReview ? "Hide Question Review" : "View Detailed Answers & Explanations"}
                  </AppText>
                  <AppText style={[styles.reviewToggleSub, { color: colors.muted }]}>
                    {showReview ? "Tap to collapse" : `Review all ${attempt.review.length} questions with solutions`}
                  </AppText>
                </View>
                <AppText style={{ fontSize: 16, color: colors.muted }}>
                  {showReview ? "▲" : "▼"}
                </AppText>
              </View>
            </Pressable>

            {/* Questions Breakdown List */}
            {showReview ? (
              <View style={styles.reviewList}>
                {attempt.review.map((item, qIndex) => {
                  const isCorrect = item.is_correct;
                  const isUnattempted = item.is_unattempted;

                  return (
                    <Card
                      key={item.question_id || qIndex}
                      style={[
                        styles.reviewCard,
                        {
                          borderColor: isCorrect
                            ? "#12B76A60"
                            : isUnattempted
                            ? "#F7900960"
                            : "#EF444460",
                        },
                      ]}
                    >
                      {/* Question Header & Status */}
                      <View style={styles.reviewQHeader}>
                        <AppText style={[styles.reviewQNum, { color: colors.muted }]}>
                          Question {qIndex + 1}
                        </AppText>
                        <Badge
                          tone={
                            isCorrect
                              ? "success"
                              : isUnattempted
                              ? "neutral"
                              : "danger"
                          }
                        >
                          {isCorrect
                            ? "✓ Correct (+1)"
                            : isUnattempted
                            ? "⚪ Skipped (0)"
                            : "✕ Incorrect (0)"}
                        </Badge>
                      </View>

                      {/* Prompt */}
                      <AppText style={[styles.reviewPrompt, { color: colors.text }]}>
                        {item.prompt}
                      </AppText>

                      {/* Options */}
                      <View style={styles.reviewOptionsList}>
                        {item.options.map((opt, oIndex) => {
                          const isOptionCorrect = opt.is_correct;
                          const wasSelected = item.user_selected.includes(opt.id);
                          const letter = OPTION_LETTERS[oIndex] || `${oIndex + 1}`;

                          let optBorderColor = colors.border;
                          let optBgColor = colors.surface;
                          let icon = "";

                          if (isOptionCorrect) {
                            optBorderColor = "#12B76A";
                            optBgColor = isDark
                              ? "rgba(18, 183, 106, 0.15)"
                              : "rgba(18, 183, 106, 0.08)";
                            icon = "✅ Correct Answer";
                          } else if (wasSelected && !isOptionCorrect) {
                            optBorderColor = "#EF4444";
                            optBgColor = isDark
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(239, 68, 68, 0.08)";
                            icon = "❌ Your Answer";
                          }

                          return (
                            <View
                              key={opt.id}
                              style={[
                                styles.reviewOptItem,
                                {
                                  borderColor: optBorderColor,
                                  backgroundColor: optBgColor,
                                },
                              ]}
                            >
                              <View style={styles.reviewOptHeader}>
                                <AppText
                                  style={[
                                    styles.reviewOptLetter,
                                    { color: colors.text },
                                  ]}
                                >
                                  {letter}. {opt.text}
                                </AppText>
                                {icon ? (
                                  <AppText
                                    style={[
                                      styles.reviewOptTag,
                                      {
                                        color: isOptionCorrect
                                          ? "#12B76A"
                                          : "#EF4444",
                                      },
                                    ]}
                                  >
                                    {icon}
                                  </AppText>
                                ) : null}
                              </View>
                            </View>
                          );
                        })}
                      </View>

                      {/* Explanation Box */}
                      {item.explanation ? (
                        <View
                          style={[
                            styles.explanationBox,
                            {
                              backgroundColor: isDark
                                ? "rgba(108, 92, 231, 0.12)"
                                : "rgba(108, 92, 231, 0.06)",
                              borderColor: brand.primary + "30",
                            },
                          ]}
                        >
                          <AppText style={[styles.explanationTitle, { color: brand.primary }]}>
                            💡 Explanation:
                          </AppText>
                          <AppText style={[styles.explanationText, { color: colors.text }]}>
                            {item.explanation}
                          </AppText>
                        </View>
                      ) : null}
                    </Card>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 14 },
  heroCard: {
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
  },
  statusEmoji: { fontSize: 44, marginBottom: 4 },
  percentageText: { fontSize: 40, fontWeight: "900", marginBottom: 8 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  quizTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 6 },
  passSub: { fontSize: 12, textAlign: "center", lineHeight: 18, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCard: {
    flex: 1,
    minWidth: "47%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  gridIcon: { fontSize: 20, marginBottom: 4 },
  gridVal: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  gridLbl: { fontSize: 11, textAlign: "center" },
  detailCard: { padding: 14 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  detailItem: { alignItems: "center", flex: 1 },
  detailItemLabel: { fontSize: 11, marginBottom: 2 },
  detailItemValue: { fontSize: 15, fontWeight: "700" },
  divider: { width: 1, height: 28 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  reviewSection: { marginTop: 10 },
  reviewToggleBtn: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  reviewToggleContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  reviewToggleTitle: { fontSize: 14, fontWeight: "700" },
  reviewToggleSub: { fontSize: 11, marginTop: 2 },
  reviewList: { marginTop: 12, gap: 12 },
  reviewCard: { padding: 14, borderWidth: 1 },
  reviewQHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  reviewQNum: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  reviewPrompt: { fontSize: 14, fontWeight: "600", lineHeight: 20, marginBottom: 12 },
  reviewOptionsList: { gap: 8, marginBottom: 10 },
  reviewOptItem: { borderWidth: 1, borderRadius: 8, padding: 10 },
  reviewOptHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 },
  reviewOptLetter: { fontSize: 13, flex: 1 },
  reviewOptTag: { fontSize: 11, fontWeight: "700" },
  explanationBox: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 4 },
  explanationTitle: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  explanationText: { fontSize: 12, lineHeight: 18 },
});

