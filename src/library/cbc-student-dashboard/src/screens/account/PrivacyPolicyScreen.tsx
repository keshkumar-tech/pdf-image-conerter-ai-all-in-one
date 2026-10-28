import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";

export default function PrivacyPolicyScreen() {
  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Privacy Policy</AppText>
      <AppText variant="muted">
        This screen renders the platform's privacy policy, fetched from the backend's
        PlatformSetting API (category: "legal") so it can be updated by admins
        without an app release. Full legal copy is supplied by Concept Builder Classes
        at launch.
      </AppText>
    </Screen>
  );
}
