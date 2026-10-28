import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, EmptyState } from "@/components/StatusStates";
import { resourcesApi } from "@/services/resources";
import type { LessonResource } from "@/services/types";

export default function TemplateLibraryScreen() {
  const [templates, setTemplates] = useState<LessonResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    resourcesApi.list({ resource_type: "template" }).then((res) => setTemplates(res.results)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Screen><LoadingState label="Loading templates..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Template Library</AppText>
      {templates.length === 0 ? (
        <EmptyState title="No templates yet" description="Project templates will appear here as they're published." />
      ) : (
        templates.map((t) => (
          <Card key={t.id} style={{ marginBottom: 12 }}>
            <AppText variant="h3">{t.title}</AppText>
          </Card>
        ))
      )}
    </Screen>
  );
}
