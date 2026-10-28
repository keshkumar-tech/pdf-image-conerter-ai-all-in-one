import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

export function Badge({ children, tone = "neutral" }: { children: string; tone?: Tone }) {
  const { colors, brand, radius } = useTheme();
  const toneMap: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: colors.border, fg: colors.text },
    success: { bg: "rgba(18,183,106,0.15)", fg: brand.success },
    warning: { bg: "rgba(247,144,9,0.15)", fg: brand.warning },
    danger: { bg: "rgba(240,68,56,0.15)", fg: brand.danger },
    primary: { bg: "rgba(108,92,231,0.15)", fg: brand.primary },
  };
  const c = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderRadius: radius.pill }]}>
      <Text style={[styles.text, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700" },
});
