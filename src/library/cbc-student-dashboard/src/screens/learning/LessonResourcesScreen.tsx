import { useEffect, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { EmptyState, LoadingState } from "@/components/StatusStates";
import { resourcesApi } from "@/services/resources";
import type { LessonResource } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "LessonResources">;

const icons: Record<string, string> = { pdf: "📄", source_code: "💻", zip: "🗜️", template: "🧩", cheat_sheet: "📋", link: "🔗" };

export default function LessonResourcesScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    resourcesApi.list({ lesson: lessonId }).then((res) => setResources(res.results)).finally(() => setIsLoading(false));
  }, [lessonId]);

  const openResource = (resource: LessonResource) => {
    if (resource.resource_type === "pdf") navigation.navigate("PdfViewer", { title: resource.title, fileUrl: resource.file_url });
    else if (resource.resource_type === "source_code") navigation.navigate("SourceCodeViewer", { resourceId: resource.id, title: resource.title });
    else if (resource.resource_type === "template") navigation.navigate("TemplateLibrary");
  };

  if (isLoading) return <Screen><LoadingState label="Loading resources..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Lesson Resources</AppText>
      {resources.length === 0 ? (
        <EmptyState title="No resources attached" description="This lesson has no downloadable resources yet." />
      ) : (
        resources.map((resource) => (
          <Pressable key={resource.id} onPress={() => openResource(resource)}>
            <Card style={{ marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <AppText variant="h3">{icons[resource.resource_type] ?? "📎"} {resource.title}</AppText>
                <AppText variant="caption" style={{ marginTop: 4 }}>{resource.resource_type.replace("_", " ")}</AppText>
              </View>
              {resource.is_premium_only && <Badge tone="warning">Premium</Badge>}
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
