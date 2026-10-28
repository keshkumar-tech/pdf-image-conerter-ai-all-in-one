import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "HomeTab">,
  NativeStackScreenProps<RootStackParamList>
>;

const menuItems: { label: string; screen: keyof RootStackParamList }[] = [
  { label: "Settings", screen: "Settings" },
  { label: "Learning Analytics", screen: "LearningAnalytics" },
  { label: "Subscription", screen: "Subscription" },
  { label: "AI Mentor", screen: "AiMentor" },
  { label: "Support", screen: "Support" },
  { label: "About", screen: "About" },
];

export default function ProfileScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <Screen>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: brand.primary, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>{(user?.username || "U")[0].toUpperCase()}</AppText>
        </View>
        <AppText variant="h2" style={{ marginTop: 12 }}>{user?.username || "Student"}</AppText>
        <AppText variant="muted">{user?.email}</AppText>
      </View>

      <Card>
        {menuItems.map((item, i) => (
          <Pressable key={item.screen} onPress={() => navigation.navigate(item.screen as any)}>
            <View style={{ paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border, flexDirection: "row", justifyContent: "space-between" }}>
              <AppText>{item.label}</AppText>
              <AppText variant="muted">›</AppText>
            </View>
          </Pressable>
        ))}
      </Card>

      <Pressable onPress={() => logout()} style={{ marginTop: 20, alignItems: "center" }}>
        <AppText style={{ color: "#F04438", fontWeight: "700" }}>Log Out</AppText>
      </Pressable>
    </Screen>
  );
}
