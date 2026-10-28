import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { socialLinksApi } from "@/services/resources";
import type { SocialLink } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminSocialLinksScreen() {
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await socialLinksApi.list({ ordering: "sort_order" });
      setLinks(res.results);
    } catch { Alert.alert("Error", "Could not load."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const deleteLink = (link: SocialLink) => {
    Alert.alert("Delete", `Delete "${link.label}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await socialLinksApi.update(String(link.id), { is_active: false } as any);
          setLinks((p) => p.filter((l) => l.id !== link.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>🔗 Social Links</AppText>
        <Pressable onPress={() => navigation.navigate("AdminSocialLinkForm", { id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Add</AppText>
        </Pressable>
      </View>
      <FlatList data={links} keyExtractor={(l) => String(l.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={[styles.iconCircle, { backgroundColor: (item.color || "#1B2B4B") + "20" }]}>
              <AppText style={{ fontSize: 22 }}>{item.icon || "🔗"}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.label, { color: colors.text }]}>{item.label}</AppText>
              <AppText style={[styles.url, { color: colors.muted }]} numberOfLines={1}>{item.url}</AppText>
              <AppText style={[styles.platform, { color: colors.muted }]}>{item.platform} · Order: {item.sort_order}</AppText>
            </View>
            <View style={{ gap: 6 }}>
              <Pressable onPress={() => navigation.navigate("AdminSocialLinkForm", { id: item.id })}
                style={[styles.actionBtn, { backgroundColor: brand.primary + "15", borderRadius: radius.sm }]}>
                <AppText style={{ color: brand.primary, fontSize: 11, fontWeight: "700" }}>✏️</AppText>
              </Pressable>
              <Pressable onPress={() => deleteLink(item)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415", borderRadius: radius.sm }]}>
                <AppText style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>🗑️</AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>🔗</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No social links</AppText></View>}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" }, addBtn: { paddingHorizontal: 14, paddingVertical: 8 }, addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  list: { padding: 12, gap: 10, paddingBottom: 32 }, card: { borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, fontWeight: "700" }, url: { fontSize: 11, marginTop: 2 }, platform: { fontSize: 11, marginTop: 1 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
