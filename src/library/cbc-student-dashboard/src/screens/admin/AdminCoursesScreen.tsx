import { useCallback, useState } from "react";
import {
  Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { coursesApi } from "@/services/resources";
import type { Course } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCourses">;

export default function AdminCoursesScreen({ navigation }: Props) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await coursesApi.list({ ordering: "-created_at" });
      const all = res.results;
      setCourses(all);
      setFiltered(all);
    } catch {
      Alert.alert("Error", "Could not load courses.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) { setFiltered(courses); return; }
    setFiltered(courses.filter((c) =>
      c.title.toLowerCase().includes(text.toLowerCase()) ||
      (c.batch_name ?? "").toLowerCase().includes(text.toLowerCase())
    ));
  };

  const togglePublish = async (course: Course) => {
    try {
      await coursesApi.update(course.slug, { is_published: !course.is_published } as any);
      const updated = courses.map((c) =>
        c.id === course.id ? { ...c, is_published: !course.is_published } : c
      );
      setCourses(updated);
      setFiltered(updated.filter((c) =>
        !search.trim() || c.title.toLowerCase().includes(search.toLowerCase())
      ));
    } catch {
      Alert.alert("Error", "Could not update course.");
    }
  };

  const deleteCourse = (course: Course) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${course.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await (coursesApi as any).remove(course.slug);
              const updated = courses.filter((c) => c.id !== course.id);
              setCourses(updated);
              setFiltered(updated);
            } catch {
              Alert.alert("Error", "Could not delete course.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading courses..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>📚 Courses</AppText>
        <Pressable
          onPress={() => navigation.navigate("AdminCourseForm", { courseId: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}
        >
          <AppText style={styles.addBtnText}>+ Add Course</AppText>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search courses..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, {
            backgroundColor: isDark ? "#1a2236" : colors.background,
            borderColor: colors.border,
            color: colors.text,
          }]}
        />
        <AppText style={[styles.countText, { color: colors.muted }]}>
          {filtered.length} courses
        </AppText>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: course }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
                  {course.title}
                </AppText>
                {!!course.batch_name && (
                  <AppText style={[styles.batchName, { color: brand.secondary ?? "#C9A227" }]}>
                    📚 {course.batch_name}
                  </AppText>
                )}
              </View>
              {/* Published toggle */}
              <Pressable
                onPress={() => togglePublish(course)}
                style={[styles.statusBadge, {
                  backgroundColor: course.is_published ? "#12B76A20" : "#F7900920",
                }]}
              >
                <AppText style={[styles.statusText, { color: course.is_published ? "#12B76A" : "#F79009" }]}>
                  {course.is_published ? "✅ Live" : "📝 Draft"}
                </AppText>
              </Pressable>
            </View>

            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={[styles.metaBadge, { backgroundColor: course.is_free ? "#12B76A15" : "#1B2B4B15" }]}>
                <AppText style={[styles.metaText, { color: course.is_free ? "#12B76A" : "#1B2B4B" }]}>
                  {course.is_free ? "🆓 Free" : "💎 Paid"}
                </AppText>
              </View>
              {course.pricing_plan && (
                <View style={[styles.metaBadge, { backgroundColor: isDark ? "#253047" : "#F0F4FF" }]}>
                  <AppText style={[styles.metaText, { color: colors.muted }]}>
                    ₹{course.pricing_plan.discount_price ?? course.pricing_plan.price}
                  </AppText>
                </View>
              )}
              <AppText style={[styles.metaText, { color: colors.muted }]}>
                👥 {course.students_count}
              </AppText>
            </View>

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() => navigation.navigate("AdminCourseForm", { courseId: course.id })}
                style={[styles.actionBtn, { backgroundColor: brand.primary + "15", borderRadius: radius.md }]}
              >
                <AppText style={[styles.actionBtnText, { color: brand.primary }]}>✏️ Edit</AppText>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("AdminCurriculum", { courseId: course.id, courseTitle: course.title })}
                style={[styles.actionBtn, { backgroundColor: "#7A5AF815", borderRadius: radius.md }]}
              >
                <AppText style={[styles.actionBtnText, { color: "#7A5AF8" }]}>📋 Curriculum</AppText>
              </Pressable>
              <Pressable
                onPress={() => deleteCourse(course)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415", borderRadius: radius.md }]}
              >
                <AppText style={[styles.actionBtnText, { color: "#EF4444" }]}>🗑️ Delete</AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📚</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No courses yet</AppText>
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Tap "+ Add Course" to create your first course</AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  searchBar: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 8, borderBottomWidth: 1, gap: 8,
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 14,
  },
  countText: { fontSize: 12 },

  list: { padding: 12, gap: 12, paddingBottom: 32 },

  card: { borderWidth: 1, padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  courseTitle: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  batchName: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  metaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  metaText: { fontSize: 11, fontWeight: "600" },

  actions: { flexDirection: "row", gap: 8, borderTopWidth: 1, paddingTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },
  actionBtnText: { fontSize: 12, fontWeight: "700" },

  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center" },
});
