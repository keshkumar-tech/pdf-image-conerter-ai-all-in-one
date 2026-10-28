import { useEffect, useState } from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { videosApi } from "@/services/resources";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProtectedVideoStatus">;

/** Diagnostic screen showing why a video is or isn't playable right now -
 * useful when entitlement or signed-URL issues need surfacing to the student. */
export default function ProtectedVideoStatusScreen({ route }: Props) {
  const { videoId } = route.params;
  const [status, setStatus] = useState<"checking" | "ready" | "blocked">("checking");

  useEffect(() => {
    videosApi.playback(videoId).then(() => setStatus("ready")).catch(() => setStatus("blocked"));
  }, [videoId]);

  return (
    <Screen>
      <AppText variant="h1">Video Protection Status</AppText>
      <Card style={{ marginTop: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText variant="h3">Playback session</AppText>
          {status === "checking" && <Badge tone="warning">Checking...</Badge>}
          {status === "ready" && <Badge tone="success">Authorized</Badge>}
          {status === "blocked" && <Badge tone="danger">Blocked</Badge>}
        </View>
        <AppText variant="muted" style={{ marginTop: 8 }}>
          {status === "blocked"
            ? "This video needs a premium entitlement, or your signed playback link expired. Return to the course to re-request access."
            : "Video access is verified per-session via a short-lived signed URL — never a permanent public link."}
        </AppText>
      </Card>
    </Screen>
  );
}
