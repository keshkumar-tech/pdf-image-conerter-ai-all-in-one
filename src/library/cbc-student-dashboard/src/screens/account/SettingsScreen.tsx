import { Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const rows: { label: string; screen: keyof RootStackParamList }[] = [
  { label: "Appearance", screen: "Appearance" },
  { label: "Account & Security", screen: "AccountSecurity" },
  { label: "Notifications", screen: "Notifications" },
  { label: "Bookmarks", screen: "Bookmarks" },
  { label: "Privacy Policy", screen: "PrivacyPolicy" },
  { label: "Terms & Conditions", screen: "TermsConditions" },
];

export default function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Settings</AppText>
      <Card>
        {rows.map((r, i) => (
          <Pressable key={r.screen} onPress={() => navigation.navigate(r.screen as any)}>
            <View style={{ paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border, flexDirection: "row", justifyContent: "space-between" }}>
              <AppText>{r.label}</AppText>
              <AppText variant="muted">›</AppText>
            </View>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}
