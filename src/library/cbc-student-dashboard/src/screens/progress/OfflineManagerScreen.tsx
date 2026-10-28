import { Pressable, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/StatusStates";
import { useDownloadsStore } from "@/store/downloadsStore";

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OfflineManagerScreen() {
  const downloads = useDownloadsStore((s) => Object.values(s.downloads));
  const total = useDownloadsStore((s) => s.totalStorageBytes());
  const remove = useDownloadsStore((s) => s.remove);

  return (
    <Screen>
      <AppText variant="h1">Offline Manager</AppText>
      <Card style={{ marginTop: 16, marginBottom: 20 }}>
        <AppText variant="h3">Storage used</AppText>
        <AppText variant="h2" style={{ marginTop: 4 }}>{formatBytes(total)}</AppText>
        <AppText variant="caption" style={{ marginTop: 4 }}>
          Downloaded premium content stays encrypted locally and is never a plain public file.
        </AppText>
      </Card>

      {downloads.length === 0 ? (
        <EmptyState title="Nothing downloaded" />
      ) : (
        downloads.map((d) => (
          <View key={d.lessonId} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 }}>
            <View>
              <AppText>{d.title}</AppText>
              <AppText variant="caption">{formatBytes(d.sizeBytes)}</AppText>
            </View>
            <Pressable onPress={() => remove(d.lessonId)}>
              <AppText style={{ color: "#F04438" }}>Delete</AppText>
            </Pressable>
          </View>
        ))
      )}
    </Screen>
  );
}
