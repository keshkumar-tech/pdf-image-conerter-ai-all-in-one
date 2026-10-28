import { useCallback, useEffect, useState } from "react";
import {
  Alert, FlatList, Pressable, RefreshControl,
  StyleSheet, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCurriculum">;

interface Lesson {
  id: string;
  title: string;
  lesson_type: "video" | "pdf" | "quiz" | "text" | "assignment";
  order: number;
  duration_minutes: number | null;
  is_free_preview: boolean;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

const LESSON_ICONS: Record<string, string> = {
  video: "🎥", pdf: "📄", quiz: "📝", text: "📰", assignment: "✏️",
};

export default function AdminCurriculumScreen({ route, navigation }: Props) {
  const { courseId, courseTitle } = route.params;
  const { colors, brand, radius } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: courseTitle });
  }, [navigation, courseTitle]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await apiClient.get(`/courses/modules/`, { params: { course: courseId } });
      const data = res.data?.results ?? res.data ?? [];
      setModules(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "Could not load curriculum.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    try {
      await apiClient.post(`/courses/modules/`, {
        course: courseId,
        title: newModuleTitle.trim(),
        order: modules.length + 1,
      });
      setNewModuleTitle("");
      load();
    } catch {
      Alert.alert("Error", "Could not add module.");
    } finally {
      setAddingModule(false);
    }
  };

  const deleteModule = (moduleId: string, title: string) => {
    Alert.alert("Delete Module", `Delete "${title}" and all its lessons?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/courses/modules/${moduleId}/`);
            setModules((prev) => prev.filter((m) => m.id !== moduleId));
          } catch {
            Alert.alert("Error", "Could not delete module.");
          }
        },
      },
    ]);
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading curriculum..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <FlatList
        data={modules}
        keyExtractor={(m) => m.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AppText style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
              📚 {courseTitle}
            </AppText>
            <AppText style={[styles.subTitle, { color: colors.muted }]}>
              {modules.length} modules
            </AppText>
          </>
        }
        renderItem={({ item: mod }) => (
          <Pressable
            onPress={() => navigation.navigate("AdminModuleLessons", {
              courseId,
              moduleId: mod.id,
              moduleTitle: mod.title,
            })}
            style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
          >
            <View style={[styles.moduleHeader, { borderBottomColor: colors.border }]}>
              <AppText style={[styles.moduleTitle, { color: colors.text }]}>
                📁 {mod.title}
              </AppText>
              <AppText style={[styles.moduleCount, { color: colors.muted }]}>
                {mod.lessons.length} lessons ›
              </AppText>
              <Pressable
                onPress={() => deleteModule(mod.id, mod.title)}
                style={[styles.deleteBtn, { backgroundColor: "#EF444415", borderRadius: radius.sm }]}
              >
                <AppText style={styles.deleteBtnText}>🗑️</AppText>
              </Pressable>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={[styles.addModuleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <AppText style={[styles.addModuleTitle, { color: colors.text }]}>➕ Add Module</AppText>
            <TextInput
              value={newModuleTitle}
              onChangeText={setNewModuleTitle}
              placeholder="Module title..."
              placeholderTextColor={colors.muted}
              style={[styles.addInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            />
            <Pressable
              onPress={addModule}
              disabled={addingModule || !newModuleTitle.trim()}
              style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md, opacity: addingModule ? 0.7 : 1 }]}
            >
              <AppText style={styles.addBtnText}>{addingModule ? "Adding..." : "Add Module"}</AppText>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📋</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No modules yet</AppText>
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Add a module below to get started</AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 12, gap: 12, paddingBottom: 32 },
  courseTitle: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  subTitle: { fontSize: 12, marginBottom: 12 },
  moduleCard: { borderWidth: 1 },
  moduleHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  moduleTitle: { flex: 1, fontSize: 14, fontWeight: "700" },
  moduleCount: { fontSize: 12 },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  deleteBtnText: { fontSize: 14 },
  emptyLessons: { paddingHorizontal: 12, paddingVertical: 12, fontSize: 12 },
  lessonRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  lessonIcon: { fontSize: 16 },
  lessonTitle: { fontSize: 13, fontWeight: "600" },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  lessonType: { fontSize: 11, textTransform: "capitalize" },
  lessonDuration: { fontSize: 11 },
  freeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  freeText: { fontSize: 10, color: "#12B76A", fontWeight: "700" },
  addModuleCard: { borderWidth: 1, padding: 14, gap: 10 },
  addModuleTitle: { fontSize: 15, fontWeight: "700" },
  addInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  addBtn: { paddingVertical: 11, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center" },
});
