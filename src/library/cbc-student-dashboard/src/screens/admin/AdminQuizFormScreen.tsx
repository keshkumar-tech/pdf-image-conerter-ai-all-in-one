import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { quizzesApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Props = NativeStackScreenProps<AdminStackParamList, "AdminQuizForm">;

const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12"];
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "All Subjects",
];
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

interface FormOption {
  text: string;
  is_correct: boolean;
  order: number;
}

interface FormQuestion {
  id?: string;
  prompt: string;
  explanation: string;
  marks: number;
  order: number;
  options: FormOption[];
}

export default function AdminQuizFormScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const { quizId } = route.params;
  const isEdit = Boolean(quizId);
  const { colors, brand, radius } = useTheme();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [classLevel, setClassLevel] = useState("Class 10");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("10");
  const [passingScore, setPassingScore] = useState("40");
  const [marksPerQ, setMarksPerQ] = useState("1");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFree, setIsFree] = useState(true);
  const [allowBackNav, setAllowBackNav] = useState(false);

  const [questions, setQuestions] = useState<FormQuestion[]>([]);

  useEffect(() => {
    if (!quizId) return;
    setIsLoading(true);
    apiClient
      .get<any>(`/quizzes/${quizId}/admin_detail/`)
      .then((res) => {
        const q = res.data;
        setTitle(q.title || "");
        setClassLevel(q.class_level || "Class 10");
        setSubject(q.subject || "Mathematics");
        setTopic(q.topic || "");
        setDifficulty(q.difficulty || "Easy");
        setTimeLimitMinutes(
          q.time_limit_seconds
            ? String(Math.round(q.time_limit_seconds / 60))
            : "10",
        );
        setPassingScore(String(q.passing_score_percent ?? 40));
        setMarksPerQ(String(q.marks_per_question ?? 1));
        setDescription(q.description || "");
        setInstructions(q.instructions || "");
        setIsPublished(q.is_published !== false);
        setIsFree(q.is_free !== false);
        setAllowBackNav(Boolean(q.allow_back_navigation));

        if (q.questions && q.questions.length > 0) {
          setQuestions(
            q.questions.map((qu: any, idx: number) => ({
              id: qu.id,
              prompt: qu.prompt,
              explanation: qu.explanation || "",
              marks: qu.marks ?? 1,
              order: qu.order ?? idx + 1,
              options: (qu.options || []).map((op: any, oIdx: number) => ({
                text: op.text,
                is_correct: Boolean(op.is_correct),
                order: op.order ?? oIdx + 1,
              })),
            })),
          );
        }
      })
      .catch(() => {
        Alert.alert("Error", "Could not load quiz details.");
        navigation.goBack();
      })
      .finally(() => setIsLoading(false));
  }, [quizId]);

  const handleAddQuestion = () => {
    const newOrder = questions.length + 1;
    setQuestions((prev) => [
      ...prev,
      {
        prompt: "",
        explanation: "",
        marks: 1,
        order: newOrder,
        options: [
          { text: "", is_correct: true, order: 1 },
          { text: "", is_correct: false, order: 2 },
          { text: "", is_correct: false, order: 3 },
          { text: "", is_correct: false, order: 4 },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof FormQuestion,
    value: any,
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleUpdateOption = (
    qIndex: number,
    optIndex: number,
    text: string,
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const options = [...q.options];
      options[optIndex] = { ...options[optIndex], text };
      q.options = options;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      q.options = q.options.map((opt, i) => ({
        ...opt,
        is_correct: i === optIndex,
      }));
      copy[qIndex] = q;
      return copy;
    });
  };
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Quiz title is required.");
      return;
    }
    if (questions.length === 0) {
      Alert.alert("Validation", "Please add at least 1 question to the quiz.");
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        Alert.alert("Validation", `Question ${i + 1} prompt cannot be empty.`);
        return;
      }
      if (q.options.length < 2) {
        Alert.alert("Validation", `Question ${i + 1} must have options.`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.is_correct);
      if (!hasCorrect) {
        Alert.alert(
          "Validation",
          `Please mark 1 correct option for Question ${i + 1}.`,
        );
        return;
      }
    }

    setIsSaving(true);
    const mins = parseInt(timeLimitMinutes, 10) || 10;
    const time_limit_seconds = mins * 60;
    const passing_score_percent = parseInt(passingScore, 10) || 40;
    const marks_per_question = parseInt(marksPerQ, 10) || 1;
    const total_marks = questions.length * marks_per_question;

    const payload = {
      title: title.trim(),
      class_level: classLevel,
      subject,
      topic: topic.trim(),
      difficulty,
      time_limit_seconds,
      passing_score_percent,
      marks_per_question,
      total_marks,
      description: description.trim(),
      instructions: instructions.trim(),
      is_published: isPublished,
      is_free: isFree,
      allow_back_navigation: allowBackNav,
      questions: questions.map((q, idx) => ({
        prompt: q.prompt.trim(),
        explanation: q.explanation.trim(),
        marks: q.marks || marks_per_question,
        order: idx + 1,
        question_type: "mcq",
        options: q.options.map((opt, oIdx) => ({
          text: opt.text.trim(),
          is_correct: opt.is_correct,
          order: oIdx + 1,
        })),
      })),
    };

    try {
      if (isEdit && quizId) {
        await quizzesApi.update(quizId, payload as any);
        Alert.alert("Success", "Quiz updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await quizzesApi.create(payload as any);
        Alert.alert("Success", "New Quiz created successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.detail || "Failed to save quiz. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingState label="Loading quiz data..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <AppText style={[styles.heading, { color: colors.text }]}>
            {isEdit ? "✏️ Edit Quiz" : "➕ Create New Quiz"}
          </AppText>

          {/* Title */}
          <AppText style={[styles.label, { color: colors.muted }]}>
            QUIZ TITLE *
          </AppText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                borderRadius: radius.md,
              },
            ]}
            placeholder="e.g. Class 10 Mathematics Chapter 1 Quiz"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Class Level Pills */}
          <AppText
            style={[styles.label, { color: colors.muted, marginTop: 12 }]}
          >
            CLASS LEVEL *
          </AppText>
          <View style={styles.pillRow}>
            {CLASS_OPTIONS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setClassLevel(c)}
                style={[
                  styles.pill,
                  {
                    borderColor:
                      classLevel === c ? brand.primary : colors.border,
                    backgroundColor:
                      classLevel === c ? brand.primary + "15" : colors.surface,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <AppText
                  style={{
                    color: classLevel === c ? brand.primary : colors.text,
                    fontWeight: classLevel === c ? "700" : "400",
                    fontSize: 12,
                  }}
                >
                  {c}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Subject Pills */}
          <AppText
            style={[styles.label, { color: colors.muted, marginTop: 12 }]}
          >
            SUBJECT *
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 4 }}
          >
            <View style={styles.pillRow}>
              {SUBJECT_OPTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSubject(s)}
                  style={[
                    styles.pill,
                    {
                      borderColor:
                        subject === s ? brand.primary : colors.border,
                      backgroundColor:
                        subject === s ? brand.primary + "15" : colors.surface,
                      borderRadius: radius.pill,
                    },
                  ]}
                >
                  <AppText
                    style={{
                      color: subject === s ? brand.primary : colors.text,
                      fontWeight: subject === s ? "700" : "400",
                      fontSize: 12,
                    }}
                  >
                    {s}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Topic */}
          <AppText
            style={[styles.label, { color: colors.muted, marginTop: 12 }]}
          >
            TOPIC / SYLLABUS
          </AppText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                borderRadius: radius.md,
              },
            ]}
            placeholder="e.g. Real Numbers & Polynomials"
            placeholderTextColor={colors.muted}
            value={topic}
            onChangeText={setTopic}
          />

          {/* Difficulty */}
          <AppText
            style={[styles.label, { color: colors.muted, marginTop: 12 }]}
          >
            DIFFICULTY
          </AppText>
          <View style={styles.pillRow}>
            {DIFFICULTY_OPTIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={[
                  styles.pill,
                  {
                    borderColor:
                      difficulty === d ? brand.primary : colors.border,
                    backgroundColor:
                      difficulty === d ? brand.primary + "15" : colors.surface,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <AppText
                  style={{
                    color: difficulty === d ? brand.primary : colors.text,
                    fontWeight: difficulty === d ? "700" : "400",
                    fontSize: 12,
                  }}
                >
                  {d}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Numeric Settings Row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText
                style={[styles.label, { color: colors.muted, marginTop: 12 }]}
              >
                TIME LIMIT (MINS)
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                keyboardType="numeric"
                value={timeLimitMinutes}
                onChangeText={setTimeLimitMinutes}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <AppText
                style={[styles.label, { color: colors.muted, marginTop: 12 }]}
              >
                PASSING SCORE (%)
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                keyboardType="numeric"
                value={passingScore}
                onChangeText={setPassingScore}
              />
            </View>
          </View>

          {/* Description */}
          <AppText
            style={[styles.label, { color: colors.muted, marginTop: 12 }]}
          >
            SHORT DESCRIPTION
          </AppText>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                borderRadius: radius.md,
              },
            ]}
            multiline
            numberOfLines={2}
            placeholder="Brief overview of what this quiz covers..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
          />

          {/* Instructions */}
          <AppText
            style={[styles.label, { color: colors.muted, marginTop: 12 }]}
          >
            INSTRUCTIONS
          </AppText>
          <TextInput
            style={[
              styles.input,
              styles.multiline,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                borderRadius: radius.md,
              },
            ]}
            multiline
            numberOfLines={2}
            placeholder="Instructions for students taking this quiz..."
            placeholderTextColor={colors.muted}
            value={instructions}
            onChangeText={setInstructions}
          />

          {/* Switches */}
          <View style={styles.switchRow}>
            <AppText style={{ color: colors.text, fontWeight: "600" }}>
              Published (Visible to students)
            </AppText>
            <Switch
              value={isPublished}
              onValueChange={setIsPublished}
              trackColor={{ true: brand.primary, false: colors.border }}
            />
          </View>

          <View style={styles.switchRow}>
            <AppText style={{ color: colors.text, fontWeight: "600" }}>
              Free Quiz (No enrollment needed)
            </AppText>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              trackColor={{ true: brand.primary, false: colors.border }}
            />
          </View>

          <View style={styles.switchRow}>
            <AppText style={{ color: colors.text, fontWeight: "600" }}>
              Allow Back Navigation
            </AppText>
            <Switch
              value={allowBackNav}
              onValueChange={setAllowBackNav}
              trackColor={{ true: brand.primary, false: colors.border }}
            />
          </View>

          {/* Questions Section */}
          <View style={styles.questionsHeader}>
            <AppText
              style={[styles.heading, { color: colors.text, fontSize: 18 }]}
            >
              Questions ({questions.length})
            </AppText>
            <Button
              label="+ Add Question"
              variant="secondary"
              size="sm"
              onPress={handleAddQuestion}
            />
          </View>

          {questions.map((q, qIdx) => (
            <Card key={qIdx} style={styles.qCard}>
              <View style={styles.qCardHeader}>
                <AppText style={[styles.qCardTitle, { color: brand.primary }]}>
                  Question {qIdx + 1}
                </AppText>
                <Pressable onPress={() => handleRemoveQuestion(qIdx)}>
                  <AppText
                    style={{
                      color: "#EF4444",
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    🗑 Remove
                  </AppText>
                </Pressable>
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.multiline,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.md,
                    marginBottom: 8,
                  },
                ]}
                placeholder={`Question ${qIdx + 1} prompt...`}
                placeholderTextColor={colors.muted}
                value={q.prompt}
                onChangeText={(val) =>
                  handleUpdateQuestion(qIdx, "prompt", val)
                }
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.md,
                    marginBottom: 10,
                  },
                ]}
                placeholder="Explanation (shown after quiz completion)"
                placeholderTextColor={colors.muted}
                value={q.explanation}
                onChangeText={(val) =>
                  handleUpdateQuestion(qIdx, "explanation", val)
                }
              />

              <AppText
                style={[styles.label, { color: colors.muted, marginBottom: 6 }]}
              >
                4 OPTIONS (Tap radio to mark CORRECT answer)
              </AppText>

              {q.options.map((opt, oIdx) => (
                <View key={oIdx} style={styles.optRow}>
                  <Pressable
                    onPress={() => handleSetCorrectOption(qIdx, oIdx)}
                    style={[
                      styles.correctRadio,
                      {
                        borderColor: opt.is_correct ? "#12B76A" : colors.border,
                        backgroundColor: opt.is_correct
                          ? "#12B76A"
                          : "transparent",
                      },
                    ]}
                  >
                    {opt.is_correct ? (
                      <AppText
                        style={{
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontWeight: "800",
                        }}
                      >
                        ✓
                      </AppText>
                    ) : null}
                  </Pressable>

                  <TextInput
                    style={[
                      styles.optInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: opt.is_correct ? "#12B76A" : colors.border,
                        color: colors.text,
                        borderRadius: radius.md,
                      },
                    ]}
                    placeholder={`Option ${["A", "B", "C", "D"][oIdx]} text`}
                    placeholderTextColor={colors.muted}
                    value={opt.text}
                    onChangeText={(val) => handleUpdateOption(qIdx, oIdx, val)}
                  />
                </View>
              ))}
            </Card>
          ))}

          {/* Save Button */}
          <View style={{ marginTop: 20, marginBottom: 40 }}>
            <Button
              label={isEdit ? "Update Quiz ✅" : "Create Quiz 🚀"}
              loading={isSaving}
              onPress={handleSave}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60 },
  heading: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multiline: { minHeight: 64, textAlignVertical: "top" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  row: { flexDirection: "row" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  questionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  qCard: { padding: 14, marginBottom: 12 },
  qCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  qCardTitle: { fontSize: 14, fontWeight: "700" },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  correctRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
});
