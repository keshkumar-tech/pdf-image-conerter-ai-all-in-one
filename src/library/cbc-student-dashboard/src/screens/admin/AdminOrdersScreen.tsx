import { useCallback, useEffect, useState } from "react";
import {
  FlatList, RefreshControl, StyleSheet, TextInput, View, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";

interface Order {
  id: string;
  user: { id: string; username: string; full_name: string; email: string; phone: string } | null;
  course: { id: string; title: string; slug: string } | null;
  amount: string;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded" | "created" | "cancelled";
  provider: string;
  provider_order_id?: string;
  payment_method?: string;
  created_at: string;
}

interface PagedResponse {
  count: number;
  results: Order[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  success:  { bg: "#12B76A20", text: "#12B76A", icon: "✅" },
  pending:  { bg: "#F7900920", text: "#F79009", icon: "⏳" },
  failed:   { bg: "#EF444420", text: "#EF4444", icon: "❌" },
  refunded: { bg: "#7A5AF820", text: "#7A5AF8", icon: "↩️" },
};

export default function AdminOrdersScreen() {
  const { colors, brand, radius } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const params: Record<string, string> = { ordering: "-created_at" };
      if (filterStatus !== "all") params.status = filterStatus;
      if (search.trim()) params.search = search.trim();
      const res = await apiClient.get<PagedResponse>("/orders/", { params });
      // Client-side fallback filtering — works even if backend ignores status/search params
      let rows = res.data.results ?? [];
      if (filterStatus !== "all") rows = rows.filter((o) => o.status === filterStatus);
      const q = search.trim().toLowerCase();
      if (q) {
        rows = rows.filter((o) =>
          (o.user?.email ?? "").toLowerCase().includes(q) ||
          (o.user?.username ?? "").toLowerCase().includes(q) ||
          (o.user?.full_name ?? "").toLowerCase().includes(q) ||
          (o.user?.phone ?? "").toLowerCase().includes(q) ||
          (o.course?.title ?? "").toLowerCase().includes(q)
        );
      }
      setOrders(rows);
      setCount(res.data.count ?? rows.length);
      // calculate revenue from successful orders
      const rev = rows
        .filter((o) => o.status === "success")
        .reduce((sum, o) => sum + parseFloat(o.amount), 0);
      setTotalRevenue(rev);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // reload when filter/search changes
  useEffect(() => { if (!isLoading) load(); }, [filterStatus]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading orders..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>🛒 Orders</AppText>
        <View style={{ alignItems: "flex-end" }}>
          <AppText style={[styles.revenueVal, { color: "#12B76A" }]}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </AppText>
          <AppText style={[styles.revenueLabel, { color: colors.muted }]}>revenue shown</AppText>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput
          value={search}
          onChangeText={(t) => setSearch(t)}
          onSubmitEditing={() => load()}
          returnKeyType="search"
          placeholder="Search by name, phone, email, course..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
        />
      </View>

      {/* Filter chips */}
      <View style={[styles.filterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {["all", "success", "pending", "failed", "refunded"].map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilterStatus(s)}
            style={[
              styles.chip,
              { borderRadius: 20, borderColor: colors.border, borderWidth: 1 },
              filterStatus === s && { backgroundColor: brand.primary, borderColor: brand.primary },
            ]}
          >
            <AppText style={[
              styles.chipText,
              { color: filterStatus === s ? "#fff" : colors.muted },
            ]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: order }) => {
          const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
          const userName = order.user?.full_name || order.user?.username || order.user?.email || "—";
          const phone = order.user?.phone || "—";
          const paymentMethod = order.payment_method || order.provider || "—";
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
              {/* Top: Course + Status */}
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
                    {order.course?.title ?? "Course removed"}
                  </AppText>
                  <AppText style={[styles.orderId, { color: colors.muted }]}>
                    Order #{order.id.slice(0, 8)}
                  </AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <AppText style={[styles.statusText, { color: sc.text }]}>
                    {sc.icon} {order.status}
                  </AppText>
                </View>
              </View>

              {/* Student info */}
              <View style={[styles.infoBlock, { borderTopColor: colors.border }]}>
                <AppText style={[styles.infoLabel, { color: colors.muted }]}>Student</AppText>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <AppText style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                    👤 {userName}
                  </AppText>
                  <AppText style={[styles.phone, { color: colors.text }]}>
                    📞 {phone}
                  </AppText>
                </View>
                {!!order.user?.email && (
                  <AppText style={[styles.email, { color: colors.muted }]} numberOfLines={1}>
                    ✉️ {order.user.email}
                  </AppText>
                )}
              </View>

              {/* Bottom: Amount + Payment method + Date */}
              <View style={[styles.cardBottom, { borderTopColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.amount, { color: brand.primary }]}>
                    {order.currency} {parseFloat(order.amount).toLocaleString("en-IN")}
                  </AppText>
                  <AppText style={[styles.paymentMethod, { color: colors.muted }]}>
                    💳 {paymentMethod.toUpperCase()}
                  </AppText>
                </View>
                <AppText style={[styles.date, { color: colors.muted }]}>
                  {formatDate(order.created_at)}
                </AppText>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <AppText style={[styles.listHeader, { color: colors.muted }]}>
            {count} orders
          </AppText>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>🛒</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No orders found</AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  revenueVal: { fontSize: 16, fontWeight: "800" },
  revenueLabel: { fontSize: 10 },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 14,
  },
  filterRow: {
    flexDirection: "row", gap: 8, padding: 10,
    borderBottomWidth: 1,
  },
  chip: { paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { fontSize: 12, fontWeight: "600" },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  listHeader: { fontSize: 12, marginBottom: 4 },
  card: { borderWidth: 1, padding: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  courseTitle: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  orderId: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  infoBlock: { borderTopWidth: 1, paddingVertical: 8, gap: 2 },
  infoLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  infoValue: { fontSize: 13, fontWeight: "700", flexShrink: 1 },
  phone: { fontSize: 12, fontWeight: "600" },
  email: { fontSize: 11, marginTop: 1 },
  cardBottom: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderTopWidth: 1, paddingTop: 8,
  },
  amount: { fontSize: 15, fontWeight: "800" },
  paymentMethod: { fontSize: 11, marginTop: 1 },
  date: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
});
