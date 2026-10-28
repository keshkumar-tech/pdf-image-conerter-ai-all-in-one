import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useAuthStore } from "@/store/authStore";

export default function AccountSecurityScreen() {
  const user = useAuthStore((s) => s.user);
  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Account & Security</AppText>
      <Card style={{ marginBottom: 16 }}>
        <AppText variant="h3">Email</AppText>
        <AppText variant="muted" style={{ marginTop: 4 }}>{user?.email}</AppText>
        <AppText variant="caption" style={{ marginTop: 4 }}>{user?.is_email_verified ? "Verified ✓" : "Not verified"}</AppText>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <AppText variant="h3">Phone</AppText>
        <AppText variant="muted" style={{ marginTop: 4 }}>{user?.phone || "Not set"}</AppText>
      </Card>
      <View style={{ gap: 12 }}>
        <Button label="Change Password" variant="secondary" fullWidth />
        <Button label="Two-Factor Authentication" variant="secondary" fullWidth />
        <Button label="Delete Account" variant="danger" fullWidth />
      </View>
    </Screen>
  );
}
