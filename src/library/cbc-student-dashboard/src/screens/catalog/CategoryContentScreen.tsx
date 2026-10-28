import { useEffect, useLayoutEffect, useCallback, useState } from "react";
import { FlatList, Linking, Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CourseListCard } from "@/components/courses/CourseListCard";
import { AppText } from "@/components/AppText";
import { EmptyCatalogState } from "@/components/catalog/EmptyCatalogState";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { coursesApi, materialsApi } from "@/services/resources";
import { filterCoursesByClass, useStudentClassStore } from "@/store/studentClassStore";
import { getApiBaseUrl } from "@/services/apiClient";
import { useTheme } from "@/theme/ThemeProvider";
import type { Course, StudyMaterial } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryContent">;

const TITLES: Record<string, string> = {
  paid: "Paid Course",
  free: "Free Courses",
  ncert: "NCERT Books",
  "paid-test": "Paid Test",
  "paid-notes": "Paid Notes",
  "free-notes": "Free Notes",
  "free-test": "Free Test",
  live: "Live Classes",
};

const MATERIAL_TYPES = ["ncert", "paid-test", "paid-notes", "free-notes", "free-test"];

const EMPTY_MESSAGES: Record<string, string> = {
  ncert: "No any NCERT books available",
  "paid-test": "No any test available",
  "paid-notes": "No any PDF available",
  "free-notes": "No any PDF available",
  "free-test": "No any test available",
  live: "No any live class available",
};

const CLASS_MAP: Record<string, string> = {
  "CLASS 9th": "Class 9", "CLASS 10th": "Class 10",
  "CLASS 11th": "Class 11", "CLASS 12th": "Class 12",
};

export default function CategoryContentScreen({ route, navigation }: Props) {
  const { type } = route.params;
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const { colors } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMaterialType = MATERIAL_TYPES.includes(type);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: TITLES[type] ?? "Content",
      headerTitleAlign: "center",
    });
  }, [navigation, type]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMaterialType) {
        const mappedClass = CLASS_MAP[selectedClass] ?? "";
        const res = await materialsApi.list({ category: type, is_active: true });
        const rows = (res.results ?? []).filter(
          (m) => !mappedClass || m.class_level === mappedClass
        );
        setMaterials(rows);
        return;
      }
      const params: Record<string, unknown> = { is_published: true };
      if (type === "paid") params.is_free = false;
      if (type === "free") params.is_free = true;
      const res = await coursesApi.list(params);
      setCourses(filterCoursesByClass(res.results, selectedClass));
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMsg = e?.response?.data;
      const isHtml = typeof serverMsg === "string" && serverMsg.trim().startsWith("<!doctype");
      const apiUrl = getApiBaseUrl();
      const msg = isHtml
        ? `Backend not reachable or endpoint missing.\nURL: ${apiUrl}\n\nOpen app → Login screen → tap logo 7 times → set correct backend URL.`
        : status
          ? `Server error (${status}). URL: ${apiUrl}`
          : "Couldn't load content.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [type, isMaterialType, selectedClass]);

  useEffect(() => { load(); }, [load]);

  const isEmptyType = ["live"].includes(type);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {isEmptyType ? (
        <EmptyCatalogState message={EMPTY_MESSAGES[type] ?? "No content available"} />
      ) : isMaterialType ? (
        isLoading ? (
          <LoadingState label="Loading..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : materials.length === 0 ? (
          <EmptyCatalogState message={EMPTY_MESSAGES[type] ?? "No content available"} />
        ) : (
          <FlatList
            data={materials}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    const rawUrl = item.pdf || item.file_url;
                    if (!rawUrl) return;
                    const backendOrigin = getApiBaseUrl().split("/api/" )[0];
                    const isBackendFile = rawUrl.startsWith(backendOrigin + "/media/");
                    let url = rawUrl;
                    if (!isBackendFile && rawUrl.startsWith("/media/")) {
                      url = backendOrigin + rawUrl;
                    }
                    if (type === "ncert" && !url.startsWith(backendOrigin + "/media/")) {
                      Linking.openURL(url).catch(() => undefined);
                    } else {
                      navigation.navigate("PdfViewer", { title: item.title, fileUrl: url });
                    }
                  }}
                  style={[styles.materialCard, { backgroundColor: "#fff", borderColor: "#E4E7EC", borderRadius: 12 }]}
                >
                <View style={styles.materialIcon}>
                  <AppText style={{ fontSize: 22 }}>
                    {type === "ncert" ? "📕" : type.includes("test") ? "📝" : "📋"}
                  </AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontWeight: "700", fontSize: 14, color: "#1B2B4B" }} numberOfLines={2}>
                    {item.title}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>
                    {item.class_level}{item.subject && item.subject !== "All Subjects" ? ` · ${item.subject}` : ""}
                  </AppText>
                </View>
                <AppText style={{ color: "#12B76A", fontWeight: "700", fontSize: 12 }}>
                  📥 Open
                </AppText>
              </Pressable>
            )}
          />
        )
      ) : isLoading ? (
        <LoadingState label="Loading..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : courses.length === 0 ? (
        <EmptyCatalogState message={`No any ${type.includes("free") ? "free" : "paid"} course available`} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CourseListCard
              course={item}
              variant="catalog"
              onPress={() => navigation.navigate("CourseDetails", { courseId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 4, paddingTop: 12, paddingBottom: 24 },
  materialCard: { flexDirection: "row", alignItems: "center", borderWidth: 1, padding: 14, marginBottom: 10, marginHorizontal: 8, gap: 12 },
  materialIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#F0F4FF", alignItems: "center", justifyContent: "center" },
});
