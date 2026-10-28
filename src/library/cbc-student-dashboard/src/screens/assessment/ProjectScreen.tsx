import { useEffect, useState } from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState } from "@/components/StatusStates";
import { apiClient } from "@/services/apiClient";
import type { Project } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Project">;

export default function ProjectScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/projects/${projectId}/`).then((r) => setProject(r.data)).finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading || !project) return <Screen><LoadingState label="Loading project brief..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1">{project.title}</AppText>
      <Card style={{ marginTop: 16 }}>
        <AppText variant="h3">Brief</AppText>
        <AppText style={{ marginTop: 8 }}>{project.brief}</AppText>
      </Card>
      {project.requirements?.length > 0 && (
        <Card style={{ marginTop: 12 }}>
          <AppText variant="h3">Requirements</AppText>
          {project.requirements.map((r, i) => <AppText key={i} style={{ marginTop: 6 }}>• {r}</AppText>)}
        </Card>
      )}
      <View style={{ marginTop: 20 }}>
        <Button label="Submit Project" fullWidth onPress={() => navigation.navigate("ProjectSubmission", { projectId: project.id })} />
      </View>
    </Screen>
  );
}
