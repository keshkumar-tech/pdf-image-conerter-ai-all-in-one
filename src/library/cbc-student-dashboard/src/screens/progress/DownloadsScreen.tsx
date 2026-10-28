import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/StatusStates";
import { useDownloadsStore } from "@/store/downloadsStore";
import type { RootStackParamList } from "@/navigation/types";

export default function DownloadsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const downloads = useDownloadsStore((s) => Object.values(s.downloads));

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <AppText variant="h1">Downloads</AppText>
        <AppText variant="muted" onPress={() => navigation.navigate("OfflineManager")}>Manage storage</AppText>
      </View>
      {downloads.length === 0 ? (
        <EmptyState title="No downloads yet" description="PDF ya lessons download karke offline read/padho." />
      ) : (
        downloads.map((d) => (
          <Card key={d.lessonId} style={{ marginBottom: 12 }}>
            <AppText variant="h3">{d.title}</AppText>
            <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Badge tone={d.status === "completed" ? "success" : "neutral"}>
                {d.status === "completed" ? "✓ Downloaded" : d.status}
              </Badge>
              {d.courseId === "pdf" && d.status === "completed" && (
                <Button
                  label="Open"
                  variant="secondary"
                  onPress={() => navigation.navigate("PdfViewer", { title: d.title, fileUrl: d.lessonId })}
                />
              )}
            </View>
            {d.progressPercent > 0 && <ProgressBar percent={d.progressPercent} />}
          </Card>
        ))
      )}
    </Screen>
  );
}
