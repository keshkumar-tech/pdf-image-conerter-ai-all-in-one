import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface Coupon {
  id: string; code: string; discount_type: string; discount_value: string;
  valid_from: string; valid_until: string | null; max_uses: number | null;
  used_count: number; is_active: boolean;
}
interface PagedRes { count: number; results: Coupon[]; }

export default function AdminCouponsScreen() {
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await apiClient.get<PagedRes>("/coupons/", { params: { ordering: "-created_at" } });
      setCoupons(res.data.results);
    } catch { Alert.alert("Error", "Could not load coupons."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = coupons.filter((c) => !search.trim() || c.code.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (coupon: Coupon) => {
    try {
      await apiClient.patch(`/coupons/${coupon.id}/`, { is_active: !coupon.is_active });
      setCoupons((p) => p.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    } catch { Alert.alert("Error", "Could not update."); }
  };

  const deleteCoupon = (coupon: Coupon) => {
    Alert.alert("Delete Coupon", `Delete coupon "${coupon.code}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await apiClient.delete(`/coupons/${coupon.id}/`);
          setCoupons((p) => p.filter((c) => c.id !== coupon.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  const formatDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No expiry";

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>🎟️ Coupons ({coupons.length})</AppText>
        <Pressable onPress={() => navigation.navigate("AdminCouponForm", { id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Create</AppText>
        </Pressable>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search by code..."
          placeholderTextColor={colors.muted} autoCapitalize="characters"
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} />
      </View>

      <FlatList data={filtered} keyExtractor={(c) => c.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={[styles.codeBadge, { backgroundColor: brand.primary + "15" }]}>
                <AppText style={[styles.codeText, { color: brand.primary }]}>{item.code}</AppText>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: item.discount_type === "percent" ? "#7A5AF815" : "#12B76A15" }]}>
                <AppText style={[styles.typeText, { color: item.discount_type === "percent" ? "#7A5AF8" : "#12B76A" }]}>
                  {item.discount_type === "percent" ? `${item.discount_value}% OFF` : `₹${item.discount_value} OFF`}
                </AppText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.is_active ? "#12B76A15" : "#EF444415" }]}>
                <AppText style={[styles.statusText, { color: item.is_active ? "#12B76A" : "#EF4444" }]}>
                  {item.is_active ? "Active" : "Off"}
                </AppText>
              </View>
            </View>

            {/* Meta */}
            <View style={styles.metaRow}>
              <AppText style={[styles.meta, { color: colors.muted }]}>📅 Until: {formatDate(item.valid_until)}</AppText>
              <AppText style={[styles.meta, { color: colors.muted }]}>
                🔢 {item.used_count}/{item.max_uses ?? "∞"} used
              </AppText>
            </View>

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable onPress={() => navigation.navigate("AdminCouponForm", { id: item.id })}
                style={[styles.actionBtn, { backgroundColor: brand.primary + "15", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: brand.primary }]}>✏️ Edit</AppText>
              </Pressable>
              <Pressable onPress={() => toggleActive(item)}
                style={[styles.actionBtn, { backgroundColor: item.is_active ? "#F7900915" : "#12B76A15", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: item.is_active ? "#F79009" : "#12B76A" }]}>
                  {item.is_active ? "⏸ Disable" : "▶ Enable"}
                </AppText>
              </Pressable>
              <Pressable onPress={() => deleteCoupon(item)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: "#EF4444" }]}>🗑️</AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>🎟️</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No coupons yet</AppText></View>}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" }, addBtn: { paddingHorizontal: 14, paddingVertical: 8 }, addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  list: { padding: 12, gap: 10, paddingBottom: 32 }, card: { borderWidth: 1, padding: 12 },
  cardTop: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  codeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }, codeText: { fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }, typeText: { fontSize: 12, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }, statusText: { fontSize: 11, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 8 }, meta: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, borderTopWidth: 1, paddingTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 7, alignItems: "center" }, actionText: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
