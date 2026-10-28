import { Alert, Pressable, ScrollView, StyleSheet, View, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";

export default function AdminSettingsScreen() {
  const { colors, brand, radius, resolved, setMode } = useTheme();
  const { user, logout } = useAuthStore();
  const isDark = resolved === "dark";

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logout() },
      ]
    );
  };

  type SettingItem =
    | { icon: string; label: string; value: string; isToggle?: undefined }
    | { icon: string; label: string; isToggle: true; toggleValue: boolean; onToggle: () => void };

  const rows: { section: string; items: SettingItem[] }[] = [
    {
      section: "Account",
      items: [
        { icon: "👤", label: "Username", value: user?.username ?? "—" },
        { icon: "📧", label: "Email", value: user?.email ?? "—" },
        { icon: "📱", label: "Phone", value: user?.phone ?? "Not set" },
        { icon: "🛡️", label: "Role", value: user?.role?.label ?? "Super Admin" },
      ],
    },
    {
      section: "App",
      items: [
        { icon: "🌙", label: "Dark Mode", isToggle: true, toggleValue: isDark, onToggle: () => setMode(isDark ? "light" : "dark") },
      ],
    },
    {
      section: "About",
      items: [
        { icon: "📱", label: "App", value: "Concept Builder Classes" },
        { icon: "🏷️", label: "Version", value: "1.0.0" },
        { icon: "🔧", label: "Build", value: "Admin Panel v1" },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>⚙️ Settings</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: brand.primary, borderRadius: radius.lg }]}>
          <View style={[styles.profileAvatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <AppText style={styles.profileAvatarText}>
              {(user?.username ?? "A")[0].toUpperCase()}
            </AppText>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <AppText style={styles.profileName}>{user?.username ?? "Admin"}</AppText>
            <AppText style={styles.profileRole}>{user?.role?.label ?? "Super Admin"}</AppText>
            <AppText style={styles.profileEmail}>{user?.email ?? ""}</AppText>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <AppText style={styles.adminBadgeText}>🛡️ ADMIN</AppText>
          </View>
        </View>

        {rows.map(({ section, items }) => (
          <View key={section} style={{ marginBottom: 16 }}>
            <AppText style={[styles.sectionTitle, { color: colors.muted }]}>{section.toUpperCase()}</AppText>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
              {items.map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.row,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  ]}
                >
                  <AppText style={styles.rowIcon}>{item.icon}</AppText>
                  <AppText style={[styles.rowLabel, { color: colors.text }]}>{item.label}</AppText>
                  {item.isToggle ? (
                    <Switch
                      value={item.toggleValue}
                      onValueChange={item.onToggle}
                      trackColor={{ true: brand.primary, false: colors.border }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <AppText style={[styles.rowValue, { color: colors.muted }]} numberOfLines={1}>
                      {item.value}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: "#EF444415", borderColor: "#EF4444", borderRadius: radius.lg }]}
        >
          <AppText style={styles.logoutIcon}>🚪</AppText>
          <AppText style={styles.logoutText}>Logout</AppText>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },

  scroll: { padding: 16 },

  profileCard: {
    flexDirection: "row", alignItems: "center",
    padding: 16, marginBottom: 20,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: "center", justifyContent: "center",
  },
  profileAvatarText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  profileName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  profileRole: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 1 },
  profileEmail: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },
  adminBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  adminBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6, marginLeft: 2 },

  card: { borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 13,
  },
  rowIcon: { fontSize: 18, width: 28 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", marginLeft: 4 },
  rowValue: { fontSize: 13, maxWidth: 160 },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderWidth: 1, gap: 8,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { color: "#EF4444", fontSize: 15, fontWeight: "800" },
});
