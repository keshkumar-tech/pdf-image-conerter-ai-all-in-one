import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { quizzesApi, quizAttemptsApi } from "@/services/resources";
import type { Quiz } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function QuizScreen({ route, navigation }: Props) {
  const { quizId } = route.params;
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest answers in ref for auto-submit
  const answersRef = useRef<Record<string, string>>({});
  answersRef.current = answers;

  const quizRef = useRef<Quiz | null>(null);
  quizRef.current = quiz;

  const elapsedRef = useRef(0);
  elapsedRef.current = elapsedSeconds;

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = await quizzesApi.retrieve(quizId);
      setQuiz(q);
      const totalSec = q.time_limit_seconds || 600;
      setSecondsRemaining(totalSec);
    } catch {
      setError("Couldn't load this quiz. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [quizId]);

  // Submit attempt function
  const submitAttempt = async (isTimeout = false) => {
    const currentQuiz = quizRef.current;
    if (!currentQuiz || isSubmitting) return;

    setIsSubmitting(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const currentAnswers = answersRef.current;
      const formattedAnswers: Record<string, string[]> = {};
      for (const [qId, optId] of Object.entries(currentAnswers)) {
        if (optId) {
          formattedAnswers[qId] = [optId];
        }
      }

      const payload = {
        quiz: currentQuiz.id,
        answers: formattedAnswers,
        time_taken_seconds: elapsedRef.current,
      };

      const attempt = await quizAttemptsApi.create(payload as any);
      if (isTimeout) {
        Alert.alert(
          "Time's Up!",
          "The quiz time has expired. Your answers have been submitted.",
          [{ text: "View Results", onPress: () => navigation.replace("QuizResult", { attemptId: attempt.id }) }]
        );
      } else {
        navigation.replace("QuizResult", { attemptId: attempt.id });
      }
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert(
        "Submission Error",
        "Could not submit your quiz. Please check your internet and try again.",
        [
          { text: "Retry", onPress: () => submitAttempt(false) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isLoading || !quiz) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);

      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Time expired!
          if (timerRef.current) clearInterval(timerRef.current);
          submitAttempt(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, quiz]);

  // Back handler prompt
  useEffect(() => {
    const onBackPress = () => {
      Alert.alert(
        "Quit Quiz?",
        "Are you sure you want to leave? Your quiz attempt in progress will not be saved.",
        [
          { text: "Stay", style: "cancel" },
          { text: "Leave", style: "destructive", onPress: () => navigation.goBack() },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => backHandler.remove();
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <LoadingState label="Preparing your quiz questions..." />
      </SafeAreaView>
    );
  }

  if (error || !quiz) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ErrorState message={error ?? "Quiz unavailable."} onRetry={load} />
      </SafeAreaView>
    );
  }

  const questions = quiz.questions || [];
  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <AppText style={{ color: colors.text, fontSize: 16 }}>
          No questions available in this quiz.
        </AppText>
        <Button label="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const total = questions.length;
  const progressPercent = ((current + 1) / total) * 100;
  const selectedOptionId = answers[question.id];

  const formatTimer = (totalSec: number | null) => {
    if (totalSec === null) return "--:--";
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeCritical = secondsRemaining !== null && secondsRemaining < 60;

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  };

  const handleNextOrSubmit = () => {
    if (!selectedOptionId) {
      Alert.alert(
        "No Option Selected",
        "Please select one of the 4 options before proceeding.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isLast) {
      Alert.alert(
        "Submit Quiz",
        "Are you ready to submit your quiz? You will see your results immediately.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit Now", onPress: () => submitAttempt(false) },
        ]
      );
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const handlePrevious = () => {
    if (quiz.allow_back_navigation && current > 0) {
      setCurrent((c) => c - 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      {/* Top Header Bar: Progress & Live Timer */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerInfoRow}>
          {/* Progress badge */}
          <View
            style={[
              styles.questionBadge,
              { backgroundColor: brand.primary + "18" },
            ]}
          >
            <AppText style={[styles.questionBadgeText, { color: brand.primary }]}>
              Question {current + 1} of {total}
            </AppText>
          </View>

          {/* Continuous Timer */}
          <View
            style={[
              styles.timerBadge,
              {
                backgroundColor: isTimeCritical ? "#EF444420" : colors.border + "40",
                borderColor: isTimeCritical ? "#EF4444" : colors.border,
              },
            ]}
          >
            <AppText style={{ fontSize: 13, marginRight: 4 }}>
              {isTimeCritical ? "⏳" : "⏱"}
            </AppText>
            <AppText
              style={[
                styles.timerText,
                { color: isTimeCritical ? "#EF4444" : colors.text },
              ]}
            >
              {formatTimer(secondsRemaining)}
            </AppText>
          </View>
        </View>

        {/* Horizontal Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: brand.primary,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <Card style={styles.questionCard}>
          <View style={styles.qHeaderRow}>
            <View
              style={[
                styles.qNumCircle,
                { backgroundColor: brand.primary },
              ]}
            >
              <AppText style={styles.qNumText}>{current + 1}</AppText>
            </View>
            <AppText style={[styles.marksText, { color: colors.muted }]}>
              {question.marks ?? 1} Mark
            </AppText>
          </View>

          <AppText style={[styles.questionPrompt, { color: colors.text }]}>
            {question.prompt}
          </AppText>
        </Card>

        {/* Instruction note */}
        <AppText style={[styles.selectPrompt, { color: colors.muted }]}>
          Select the single correct option:
        </AppText>

        {/* 4 MCQ Options */}
        <View style={styles.optionsList}>
          {question.options.map((opt, index) => {
            const isSelected = selectedOptionId === opt.id;
            const letter = OPTION_LETTERS[index] || `${index + 1}`;

            return (
              <Pressable
                key={opt.id}
                onPress={() => handleSelectOption(opt.id)}
                style={({ pressed }) => [
                  styles.optionWrapper,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Card
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? brand.primary : colors.border,
                      backgroundColor: isSelected
                        ? isDark
                          ? "rgba(108, 92, 231, 0.22)"
                          : "rgba(108, 92, 231, 0.08)"
                        : colors.surface,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.optionContentRow}>
                    {/* Letter badge / Radio Indicator */}
                    <View
                      style={[
                        styles.letterCircle,
                        {
                          backgroundColor: isSelected
                            ? brand.primary
                            : colors.border + "50",
                          borderColor: isSelected
                            ? brand.primary
                            : colors.border,
                        },
                      ]}
                    >
                      <AppText
                        style={[
                          styles.letterText,
                          {
                            color: isSelected ? "#FFFFFF" : colors.text,
                          },
                        ]}
                      >
                        {letter}
                      </AppText>
                    </View>

                    {/* Option Text */}
                    <AppText
                      style={[
                        styles.optionText,
                        {
                          color: colors.text,
                          fontWeight: isSelected ? "700" : "400",
                        },
                      ]}
                    >
                      {opt.text}
                    </AppText>

                    {/* Checkmark indicator for selected */}
                    {isSelected ? (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: brand.primary },
                        ]}
                      >
                        <AppText style={styles.checkText}>✓</AppText>
                      </View>
                    ) : null}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Navigation & Action Bar */}
      <View
        style={[
          styles.footerBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        {quiz.allow_back_navigation ? (
          <Button
            label="← Previous"
            variant="secondary"
            disabled={current === 0 || isSubmitting}
            onPress={handlePrevious}
            style={{ minWidth: 100 }}
          />
        ) : (
          <View style={styles.noBackNotice}>
            <AppText style={[styles.noBackText, { color: colors.muted }]}>
              🔒 One-way test
            </AppText>
          </View>
        )}

        <Button
          label={
            isLast
              ? "Submit Quiz ✅"
              : "Next Question →"
          }
          loading={isSubmitting}
          onPress={handleNextOrSubmit}
          style={{ flex: 1, marginLeft: 12 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  questionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  questionBadgeText: { fontSize: 13, fontWeight: "700" },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  timerText: { fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  questionCard: {
    padding: 18,
    marginBottom: 14,
  },
  qHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  qNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qNumText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  marksText: { fontSize: 12, fontWeight: "600" },
  questionPrompt: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  selectPrompt: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionsList: {
    gap: 10,
  },
  optionWrapper: {
    width: "100%",
  },
  optionCard: {
    padding: 14,
  },
  optionContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  letterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 14,
    fontWeight: "700",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  footerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  noBackNotice: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noBackText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

