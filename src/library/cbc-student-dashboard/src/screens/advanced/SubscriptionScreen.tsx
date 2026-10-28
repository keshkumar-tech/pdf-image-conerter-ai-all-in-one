import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, EmptyState } from "@/components/StatusStates";
import { useResourceList } from "@/hooks/useResource";
import { entitlementsApi } from "@/services/resources";
import type { Entitlement } from "@/services/types";

export default function SubscriptionScreen() {
  const { data, isLoading } = useResourceList<Entitlement>(entitlementsApi);

  if (isLoading) return <Screen><LoadingState label="Loading your entitlements..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Subscription & Entitlements</AppText>
      {data.length === 0 ? (
        <EmptyState title="No premium courses yet" description="Purchase a course to see your access here." />
      ) : (
        data.map((e) => (
          <Card key={e.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <AppText variant="h3">Course {e.course.slice(0, 8)}</AppText>
              <Badge tone={e.is_active ? "success" : "danger"}>{e.is_active ? "Active" : "Expired"}</Badge>
            </View>
            <AppText variant="caption" style={{ marginTop: 4 }}>
              {e.expires_at ? `Expires ${new Date(e.expires_at).toLocaleDateString()}` : "Lifetime access"}
            </AppText>
          </Card>
        ))
      )}
    </Screen>
  );
}
