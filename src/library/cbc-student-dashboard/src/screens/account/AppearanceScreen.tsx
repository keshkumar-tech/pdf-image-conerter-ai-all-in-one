import { Pressable, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useTheme, type ThemeMode } from "@/theme/ThemeProvider";

const options: { label: string; value: ThemeMode }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function AppearanceScreen() {
  const { colors, brand, mode, setMode } = useTheme();
  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Appearance</AppText>
      <Card>
        {options.map((opt, i) => (
          <Pressable key={opt.value} onPress={() => setMode(opt.value)}>
            <View style={{ paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border, flexDirection: "row", justifyContent: "space-between" }}>
              <AppText>{opt.label}</AppText>
              {mode === opt.value && <AppText style={{ color: brand.primary, fontWeight: "700" }}>✓</AppText>}
            </View>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}
