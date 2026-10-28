import { useCallback, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { CourseListCard } from "@/components/courses/CourseListCard";
import { EmptyCatalogState } from "@/components/catalog/EmptyCatalogState";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { enrollmentsApi } from "@/services/resources";
import { filterCoursesByClass, useStudentClassStore } from "@/store/studentClassStore";
import type { Enrollment } from "@/services/types";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "MyCoursesTab">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MyLearningScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const [data, setData] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    enrollmentsApi.list()
      .then((res) => {
        const withDetail = res.results.filter((e) => e.course_detail);
        const filtered = filterCoursesByClass(
          withDetail.map((e) => e.course_detail!),
          selectedClass
        );
        const ids = new Set(filtered.map((c) => c.id));
        setData(res.results.filter((e) => ids.has(e.course) || filtered.length === withDetail.length));
      })
      .catch(() => setError("Couldn't load your courses."))
      .finally(() => setIsLoading(false));
  }, [selectedClass]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: colors.background }}>
        <AppText variant="h1">My Courses</AppText>
        <AppText variant="muted" style={{ marginTop: 4 }}>{selectedClass}</AppText>
      </View>

      {isLoading ? <LoadingState label="Loading your courses..." /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       data.length === 0 ? (
        <EmptyCatalogState message="No any course enrolled yet" />
       ) : (
        <View style={{ flex: 1, backgroundColor: "#F2F4F7", paddingHorizontal: 12, paddingTop: 4 }}>
          {data.map((enrollment) => {
            const course = enrollment.course_detail;
            if (!course) return null;
            return (
              <CourseListCard
                key={enrollment.id}
                course={course}
                variant="catalog"
                onPress={() => navigation.navigate("CourseDetails", { courseId: enrollment.course })}
              />
            );
          })}
        </View>
       )}
    </Screen>
  );
}
