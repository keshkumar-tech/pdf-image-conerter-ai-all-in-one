import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { quizzesApi } from "@/services/resources";
import type { Quiz } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const FILTER_CLASSES = ["All", "Class 10", "Class 9", "Class 11", "Class 12"];

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

export default function AdminQuizzesScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, brand, radius } = useTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState("All");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await quizzesApi.list({
        ordering: "-created_at",
        page_size: 100,
      } as any);
      setQuizzes(res.results);
    } catch {
      Alert.alert("Error", "Could not load quizzes.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = (quiz: Quiz) => {
    Alert.alert(
      "Delete Quiz",
      `Are you sure you want to delete "${quiz.title}"? All associated questions will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await quizzesApi.delete(quiz.id);
              setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
              Alert.alert("Deleted", "Quiz removed successfully.");
            } catch {
              Alert.alert("Error", "Failed to delete quiz.");
            }
          },
        },
      ]
    );
  };

  const filteredQuizzes = quizzes.filter((q) => {
    if (selectedClassFilter === "All") return true;
    return q.class_level === selectedClassFilter;
  });

  if (isLoading)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingState label="Loading quizzes..." />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>
            🧠 Quiz Manager
          </AppText>
          <AppText style={[styles.headerSub, { color: colors.muted }]}>
            Create, edit, and organize quizzes & questions
          </AppText>
        </View>

        <Button
          label="+ New Quiz"
          size="sm"
          onPress={() => navigation.navigate("AdminQuizForm", { quizId: null })}
        />
      </View>

      {/* Class Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CLASSES}
          keyExtractor={(c) => c}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedClassFilter === item;
            return (
              <Pressable
                onPress={() => setSelectedClassFilter(item)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? brand.primary
                      : colors.surface,
                    borderColor: isSelected ? brand.primary : colors.border,
                  },
                ]}
              >
                <AppText
                  style={{
                    color: isSelected ? "#FFFFFF" : colors.text,
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: 12,
                  }}
                >
                  {item}
                </AppText>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Quizzes List */}
      <FlatList
        data={filteredQuizzes}
        keyExtractor={(q) => String(q.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={brand.primary}
          />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const subColor = SUBJECT_COLORS[item.subject || ""] || brand.primary;
          const diffColor =
            item.difficulty === "Easy"
              ? "#12B76A"
              : item.difficulty === "Medium"
              ? "#F79009"
              : "#EF4444";

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                },
              ]}
            >
              {/* Badges Row */}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.tagBadge,
                    { backgroundColor: subColor + "20" },
                  ]}
                >
                  <AppText style={[styles.tagText, { color: subColor }]}>
                    {item.subject || "General"}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.tagBadge,
                    { backgroundColor: colors.border + "50" },
                  ]}
                >
                  <AppText style={[styles.tagText, { color: colors.text }]}>
                    {item.class_level || "Class 10"}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.tagBadge,
                    { backgroundColor: diffColor + "20" },
                  ]}
                >
                  <AppText style={[styles.tagText, { color: diffColor }]}>
                    ● {item.difficulty || "Easy"}
                  </AppText>
                </View>
                <View style={{ marginLeft: "auto" }}>
                  <Badge tone={item.is_published !== false ? "success" : "neutral"}>
                    {item.is_published !== false ? "Published" : "Draft"}
                  </Badge>
                </View>
              </View>

              {/* Title & Topic */}
              <AppText
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.title}
              </AppText>

              {item.topic ? (
                <AppText style={[styles.topicText, { color: colors.muted }]}>
                  Topic: {item.topic}
                </AppText>
              ) : null}

              {/* Meta Stats */}
              <AppText style={[styles.meta, { color: colors.muted }]}>
                ❓ {item.questions?.length ?? item.questions_count ?? 0} questions · ⏱{" "}
                {item.time_limit_seconds
                  ? `${Math.round(item.time_limit_seconds / 60)} min`
                  : "Untimed"}{" "}
                · ✅ {item.passing_score_percent}% to pass · 🏆{" "}
                {item.total_marks || (item.questions?.length ?? 10)} marks
              </AppText>

              {/* Action Buttons */}
              <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                <Pressable
                  onPress={() =>
                    navigation.navigate("AdminQuizForm", { quizId: item.id })
                  }
                  style={[styles.actionBtn, { backgroundColor: brand.primary + "15" }]}
                >
                  <AppText style={[styles.actionBtnText, { color: brand.primary }]}>
                    ✏️ Edit Quiz & Questions
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(item)}
                  style={[styles.actionBtn, { backgroundColor: "#EF444415" }]}
                >
                  <AppText style={[styles.actionBtnText, { color: "#EF4444" }]}>
                    🗑️ Delete
                  </AppText>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={{ fontSize: 36 }}>🧠</AppText>
            <AppText style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
              No quizzes found
            </AppText>
            <AppText
              style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}
            >
              Tap "+ New Quiz" above to create a new MCQ quiz.
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 2 },
  filterBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  list: { padding: 14, gap: 12, paddingBottom: 40 },
  card: { borderWidth: 1, padding: 14 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: "700" },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  topicText: { fontSize: 12, marginBottom: 4, fontWeight: "500" },
  meta: { fontSize: 12, marginBottom: 10 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});

