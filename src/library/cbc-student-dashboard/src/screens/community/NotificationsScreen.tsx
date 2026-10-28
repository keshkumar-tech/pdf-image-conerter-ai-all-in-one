import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusStates";
import { useResourceList } from "@/hooks/useResource";
import { notificationsApi } from "@/services/resources";
import type { NotificationItem } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

export default function NotificationsScreen({}: Props) {
  const { data, isLoading, error, refetch } = useResourceList<NotificationItem>(notificationsApi);

  return (
    <Screen padded={false}>
      <View style={{ padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#E4E7EC" }}>
        <AppText variant="h1">Notifications</AppText>
        <AppText variant="muted" style={{ marginTop: 4 }}>All updates for your class</AppText>
      </View>

      {isLoading ? <LoadingState label="Loading notifications..." /> :
       error ? <ErrorState message={error} onRetry={refetch} /> :
       data.length === 0 ? (
        <View style={{ padding: 16 }}>
          <EmptyState title="No notifications" description="No any notification available right now." />
        </View>
       ) :
        data.map((n) => (
          <Pressable key={n.id} onPress={() => notificationsApi.action(n.id, "read")}>
            <Card style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 0, opacity: n.is_read ? 0.7 : 1, borderColor: n.is_read ? "#E4E7EC" : "#1B2B4B" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Badge tone={n.is_read ? "neutral" : "primary"}>{n.notification_type}</Badge>
                {!n.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#C9A227" }} />}
              </View>
              <AppText variant="h3" style={{ marginTop: 8 }}>{n.title}</AppText>
              <AppText variant="muted" style={{ marginTop: 4, lineHeight: 20 }}>{n.body}</AppText>
              <AppText variant="caption" style={{ marginTop: 8 }}>
                {new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </AppText>
            </Card>
          </Pressable>
        ))
      }
    </Screen>
  );
}
