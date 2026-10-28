import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";

interface HomeFeatureCardProps {
  icon: string;
  label: string;
  accent: string;
  count?: number | string | null;
  countSuffix?: string;
  onPress?: () => void;
}

export function HomeFeatureCard({
  icon,
  label,
  accent,
  count,
  countSuffix,
  onPress,
}: HomeFeatureCardProps) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {count !== undefined && count !== null ? (
        <View
          style={[
            styles.badgeWrap,
            {
              backgroundColor: `${accent}18`,
              borderColor: `${accent}35`,
            },
          ]}
        >
          <AppText style={[styles.badgeText, { color: accent }]}>
            {count}
          </AppText>
        </View>
      ) : null}

      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <AppText style={styles.icon}>{icon}</AppText>
      </View>
      <AppText variant="caption" style={styles.label} numberOfLines={1}>
        {label}
      </AppText>
      {count !== undefined && count !== null && countSuffix ? (
        <AppText style={[styles.subLabel, { color: colors.muted }]} numberOfLines={1}>
          {count} {countSuffix}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 114,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    position: "relative",
  },
  badgeWrap: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  icon: { fontSize: 24 },
  label: { textAlign: "center", fontWeight: "700", fontSize: 11, lineHeight: 15 },
  subLabel: { textAlign: "center", fontSize: 10, marginTop: 2, fontWeight: "500" },
});
