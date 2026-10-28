import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OfflineState } from "@/components/StatusStates";
import { Screen } from "@/components/Screen";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ErrorOffline">;

/** Global fallback shown by the navigation/error boundary when the app
 * detects no connectivity or an unrecoverable API error. */
export default function ErrorOfflineScreen({ navigation }: Props) {
  return (
    <Screen>
      <OfflineState onRetry={() => navigation.navigate("MainTabs")} />
    </Screen>
  );
}
