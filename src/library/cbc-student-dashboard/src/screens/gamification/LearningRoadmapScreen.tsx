import { useEffect, useState } from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, EmptyState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { roadmapsApi } from "@/services/resources";
import type { Roadmap } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "LearningRoadmap">;

export default function LearningRoadmapScreen({ route, navigation }: Props) {
  const { brand, colors } = useTheme();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = route.params?.roadmapId
      ? roadmapsApi.retrieve(route.params.roadmapId)
      : roadmapsApi.list().then((r) => r.results[0]);
    load.then((r) => setRoadmap(r ?? null)).finally(() => setIsLoading(false));
  }, [route.params?.roadmapId]);

  if (isLoading) return <Screen><LoadingState label="Loading roadmap..." /></Screen>;
  if (!roadmap) return <Screen><EmptyState title="No roadmap available" /></Screen>;

  return (
    <Screen>
      <AppText variant="h1">{roadmap.title}</AppText>
      <AppText variant="muted" style={{ marginTop: 4, marginBottom: 20 }}>{roadmap.description}</AppText>

      {roadmap.nodes.map((node, i) => (
        <View key={node.id} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
          <View style={{ alignItems: "center", marginRight: 12 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: brand.primary, alignItems: "center", justifyContent: "center" }}>
              <AppText style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{i + 1}</AppText>
            </View>
            {i < roadmap.nodes.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 }} />}
          </View>
          <Card style={{ flex: 1, marginBottom: 16 }}>
            <AppText variant="h3">{node.title}</AppText>
            {node.course && (
              <AppText
                variant="caption"
                style={{ marginTop: 4, color: brand.primary }}
                onPress={() => navigation.navigate("CourseDetails", { courseId: node.course! })}
              >
                View course →
              </AppText>
            )}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
