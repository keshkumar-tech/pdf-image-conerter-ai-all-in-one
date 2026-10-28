import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { socialLinksApi } from "@/services/resources";
import type { SocialLink } from "@/services/types";

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000", instagram: "#E1306C", telegram: "#0088CC",
  whatsapp: "#25D366", facebook: "#1877F2", twitter: "#1DA1F2",
  linkedin: "#0A66C2", website: "#1B2B4B", other: "#667085",
};

export default function SocialLinksScreen() {
  const { colors, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socialLinksApi.list({ is_active: true })
      .then((res) => setLinks(res.results))
      .catch(() => setError("Could not load social links."))
      .finally(() => setIsLoading(false));
  }, []);

  const open = (url: string) => Linking.openURL(url).catch(() => undefined);

  if (isLoading) return <Screen><LoadingState label="Loading..." /></Screen>;
  if (error) return <Screen><ErrorState message={error} onRetry={() => {}} /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <AppText style={[styles.heading, { color: colors.text }]}>Follow Us</AppText>
        <AppText style={[styles.sub, { color: colors.muted }]}>
          Stay connected for updates, notes & free content
        </AppText>
      </View>

      {links.map((item) => {
        const color = item.color || PLATFORM_COLORS[item.platform] || "#1B2B4B";
        return (
          <Pressable
            key={item.id}
            onPress={() => open(item.url)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: isDark ? colors.surface : color + "12",
                borderColor: isDark ? colors.border : color + "33",
                borderRadius: radius.lg,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.iconBubble, { backgroundColor: color + "22" }]}>
              <AppText style={styles.iconText}>{item.icon || "🔗"}</AppText>
            </View>
            <View style={styles.textCol}>
              <AppText style={[styles.platformName, { color }]}>{item.label}</AppText>
              <AppText style={[styles.urlText, { color: colors.muted }]} numberOfLines={1}>
                {item.url}
              </AppText>
            </View>
            <View style={[styles.arrowBubble, { backgroundColor: color }]}>
              <AppText style={styles.arrowText}>→</AppText>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  heading: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, padding: 14, marginBottom: 12, gap: 14 },
  iconBubble: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 26 },
  textCol: { flex: 1 },
  platformName: { fontSize: 15, fontWeight: "800" },
  urlText: { fontSize: 12, marginTop: 3 },
  arrowBubble: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  arrowText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
