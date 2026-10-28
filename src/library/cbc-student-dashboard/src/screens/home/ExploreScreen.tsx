import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { CourseCard } from "@/components/CourseCard";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { useResourceList } from "@/hooks/useResource";
import { coursesApi } from "@/services/resources";
import type { Course } from "@/services/types";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "HomeTab">,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES = ["All", "Web Development", "App Development", "Programming", "Databases", "Marketing"];

export default function ExploreScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const [category, setCategory] = useState("All");

  const listParams: Record<string, unknown> = { is_published: true };
  if (category !== "All") listParams.category__slug = category.toLowerCase().replace(/\s/g, "-");

  const { data, isLoading, error, refetch } = useResourceList<Course>(coursesApi, listParams);

  const title = "Explore";

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ padding: 16 }}>
        <AppText variant="h1">{title}</AppText>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}
          data={CATEGORIES} keyExtractor={(c) => c}
          renderItem={({ item }) => (
            <Pressable onPress={() => setCategory(item)} style={{ marginRight: 8 }}>
              <Badge tone={item === category ? "primary" : "neutral"}>{item}</Badge>
            </Pressable>
          )}
        />
      </View>
      {isLoading ? <LoadingState label="Finding courses..." /> :
       error ? <ErrorState message={error} onRetry={refetch} /> :
       data.length === 0 ? <EmptyState title="No courses found" description="Try a different category." /> :
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={data} keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => navigation.navigate("CourseDetails", { courseId: item.id })} />
          )}
        />
      }
    </Screen>
  );
}
