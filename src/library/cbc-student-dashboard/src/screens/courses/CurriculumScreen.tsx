import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { Module } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Curriculum">;

const lessonIcon: Record<string, string> = {
  video: "▶️", pdf: "📄", source_code: "💻", template: "🧩", quiz: "❓", assignment: "📝", project: "🚀",
};

export default function CurriculumScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const { colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    apiClient.get(`/courses/${courseId}/`)
      .then((res) => setModules(res.data.modules ?? []))
      .catch(() => setError("Couldn't load curriculum."))
      .finally(() => setIsLoading(false));
  };
  useEffect(load, [courseId]);

  const openLesson = (lesson: Module["lessons"][number]) => {
    if (lesson.lesson_type === "video") navigation.navigate("VideoPlayer", { lessonId: lesson.id, videoId: lesson.id });
    else if (lesson.lesson_type === "quiz") navigation.navigate("QuizDetail", { quizId: lesson.id });
    else if (lesson.lesson_type === "assignment") navigation.navigate("Assignment", { assignmentId: lesson.id });
    else if (lesson.lesson_type === "project") navigation.navigate("Project", { projectId: lesson.id });
    else navigation.navigate("LessonResources", { lessonId: lesson.id });
  };

  if (isLoading) return <Screen><LoadingState label="Loading curriculum..." /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Curriculum</AppText>
      {modules.map((mod) => (
        <Card key={mod.id} style={{ marginBottom: 12 }}>
          <AppText variant="h3">{mod.title}</AppText>
          {mod.lessons?.map((lesson) => (
            <Pressable key={lesson.id} onPress={() => openLesson(lesson)}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 }}>
                <AppText>{lessonIcon[lesson.lesson_type] ?? "•"} {lesson.title}</AppText>
                {lesson.is_free_preview && <AppText variant="caption">Free preview</AppText>}
              </View>
            </Pressable>
          ))}
        </Card>
      ))}
    </Screen>
  );
}
