import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/services/apiClient";

interface Overview {
  total_students: number;
  active_students: number;
  new_registrations_30d: number;
  total_courses: number;
  premium_courses: number;
  free_courses: number;
  total_revenue: number;
  total_orders: number;
  conversion_rate_percent: number;
  course_completion_rate_percent: number;
}

const STAT_CARDS = [
  { key: "total_students",           label: "Total Students",    icon: "👨‍🎓", color: "#2E90FA" },
  { key: "active_students",          label: "Active (30d)",      icon: "🟢", color: "#12B76A" },
  { key: "new_registrations_30d",    label: "New (30d)",         icon: "🆕", color: "#7A5AF8" },
  { key: "total_courses",            label: "Total Courses",     icon: "📚", color: "#F79009" },
  { key: "premium_courses",          label: "Premium Courses",   icon: "💎", color: "#1B2B4B" },
  { key: "free_courses",             label: "Free Courses",      icon: "🆓", color: "#12B76A" },
  { key: "total_revenue",            label: "Total Revenue",     icon: "💰", color: "#12B76A", prefix: "₹" },
  { key: "total_orders",             label: "Orders",            icon: "🛒", color: "#2E90FA" },
  { key: "conversion_rate_percent",  label: "Conversion",        icon: "📈", color: "#F79009", suffix: "%" },
  { key: "course_completion_rate_percent", label: "Completion",  icon: "🏆", color: "#7A5AF8", suffix: "%" },
];

export default function AdminDashboardScreen() {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const user = useAuthStore((s) => s.user);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await apiClient.get<Overview>("/analytics/admin/overview/");
      setOverview(res.data);
    } catch (e: any) {
      console.warn("Overview load failed:", e?.response?.status, e?.message);
      // fail silently, show zeros
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.adminBadge, { backgroundColor: brand.primary }]}>
          <AppText style={styles.adminBadgeText}>ADMIN</AppText>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</AppText>
          <AppText style={[styles.headerSub, { color: colors.muted }]}>
            {user?.username ?? "superadmin"} · {user?.role?.label ?? "Super Admin"}
          </AppText>
        </View>
        <AppText style={{ fontSize: 22 }}>🛡️</AppText>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome card */}
        <View style={[styles.welcomeCard, { backgroundColor: brand.primary, borderRadius: radius.lg }]}>
          <AppText style={styles.welcomeTitle}>Welcome back, {user?.username ?? "Admin"}! 👋</AppText>
          <AppText style={styles.welcomeSub}>
            {isLoading ? "Loading stats..." : `${overview?.total_students ?? 0} students enrolled across ${overview?.total_courses ?? 0} courses`}
          </AppText>
        </View>

        {/* Stats grid */}
        <AppText style={[styles.sectionTitle, { color: colors.text }]}>📊 Overview</AppText>
        <View style={styles.grid}>
          {STAT_CARDS.map(({ key, label, icon, color, prefix, suffix }) => {
            const raw = overview ? (overview as any)[key] ?? 0 : 0;
            const value = typeof raw === "number" && !Number.isInteger(raw)
              ? raw.toFixed(1)
              : raw.toLocaleString("en-IN");
            return (
              <View
                key={key}
                style={[styles.statCard, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                }]}
              >
                <AppText style={styles.statIcon}>{icon}</AppText>
                <AppText style={[styles.statValue, { color }]}>
                  {isLoading ? "—" : `${prefix ?? ""}${value}${suffix ?? ""}`}
                </AppText>
                <AppText style={[styles.statLabel, { color: colors.muted }]}>{label}</AppText>
              </View>
            );
          })}
        </View>

        {/* Quick actions */}
        <AppText style={[styles.sectionTitle, { color: colors.text }]}>⚡ Quick Actions</AppText>
        <View style={[styles.actionsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          {[
            { icon: "📚", label: "Manage Courses", sub: "Add, edit, publish courses" },
            { icon: "👨‍🎓", label: "Manage Students", sub: "View, activate, deactivate" },
            { icon: "🛒", label: "View Orders", sub: "Track purchases & revenue" },
            { icon: "⚙️", label: "Settings", sub: "App configuration" },
          ].map(({ icon, label, sub }, idx) => (
            <View
              key={label}
              style={[styles.actionRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <AppText style={styles.actionIcon}>{icon}</AppText>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText style={[styles.actionLabel, { color: colors.text }]}>{label}</AppText>
                <AppText style={[styles.actionSub, { color: colors.muted }]}>{sub}</AppText>
              </View>
              <AppText style={[styles.actionArrow, { color: colors.muted }]}>›</AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  adminBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  adminBadgeText: { color: "#fff", fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 1 },

  scroll: { padding: 16, paddingBottom: 32 },

  welcomeCard: { padding: 18, marginBottom: 20 },
  welcomeTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  welcomeSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },

  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    width: "47%", padding: 14, borderWidth: 1,
    alignItems: "center", gap: 4,
  },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },

  actionsCard: { borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 14, fontWeight: "700" },
  actionSub: { fontSize: 12, marginTop: 1 },
  actionArrow: { fontSize: 22 },
});
