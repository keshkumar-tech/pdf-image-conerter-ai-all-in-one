import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export function ProgressBar({ percent }: { percent: number }) {
  const { colors, brand, radius } = useTheme();
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.track, { backgroundColor: colors.border, borderRadius: radius.pill }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: brand.primary, borderRadius: radius.pill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, width: "100%", overflow: "hidden" },
  fill: { height: "100%" },
});
