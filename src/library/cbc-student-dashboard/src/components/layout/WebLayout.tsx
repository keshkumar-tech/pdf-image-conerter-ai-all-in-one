import { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";

/**
 * WebLayout — the web translation of the app's navigation chrome.
 *
 * What it replaces (UI only — the routes/screens behind it are unchanged):
 *   • `MainTabs` bottom tab bar  -> a TOP nav bar (same items, same order).
 *   • `HomeDrawer` side drawer   -> an always-visible LEFT sidebar (same items).
 *
 * So on mobile the app had: bottom tabs + a hamburger drawer.
 * On web it now has:        top tabs  + a permanent left sidebar.
 *
 * On native (Platform.OS !== "web") this component renders the children
 * untouched, so the original mobile app is unaffected.
 */

export interface WebNavItem {
  key: string;
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface WebLayoutProps {
  children: React.ReactNode;
  /** Top nav items (previously the bottom tabs). */
  tabs: WebNavItem[];
  activeTab: string;
  /** Left sidebar items (previously the drawer). */
  menu: WebNavItem[];
  /** Secondary sidebar links (social links etc.). */
  socials?: { icon: string; url: string }[];
  title?: string;
}

const SIDEBAR_WIDTH = 248;

export function WebLayout({
  children,
  tabs,
  activeTab,
  menu,
  socials = [],
  title,
}: WebLayoutProps) {
  const { colors, brand, resolved } = useTheme();
  const isDark = resolved === "dark";
  const user = useAuthStore((s) => s.user);
  const [notice, setNotice] = useState<string | null>(null);

  // On native, render the app as-is (no web chrome).
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const surface = isDark ? "#0d1224" : "#ffffff";
  const bg = isDark ? "#0B1220" : "#F6F7FB";

  const toast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2200);
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      {/* ── LEFT SIDEBAR (was the drawer) ── */}
      <View
        style={[
          styles.sidebar,
          { backgroundColor: surface, borderRightColor: colors.border },
        ]}
      >
        {/* Profile block */}
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: brand.primary }]}>
            <Text style={styles.avatarText}>
              {(user?.username || "S")[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={{ minWidth: 0 }}>
            <Text
              style={[styles.profileName, { color: colors.text }]}
              numberOfLines={1}
            >
              {user?.username || "Student"}
            </Text>
            <Text
              style={[styles.profileSub, { color: colors.muted }]}
              numberOfLines={1}
            >
              Concept Builder Classes
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Menu items (the drawer's list) */}
        <View style={styles.menuList}>
          {menu.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: isDark ? "#1a2236" : "#F1F5F9" },
              ]}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.menuLabel,
                  { color: item.danger ? brand.danger : colors.text },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Social links (drawer footer) */}
        {socials.length > 0 && (
          <>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <Text style={[styles.sideHeading, { color: colors.muted }]}>
              Follow us
            </Text>
            <View style={styles.socialRow}>
              {socials.map((s, i) => (
                <Pressable
                  key={i}
                  onPress={() => Linking.openURL(s.url).catch(() => undefined)}
                  style={[styles.socialBtn, { borderColor: colors.border }]}
                >
                  <Text>{s.icon}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {/* ── MAIN COLUMN ── */}
      <View style={styles.main}>
        {/* ── TOP NAV BAR (was the bottom tab bar) ── */}
        <View
          style={[
            styles.topnav,
            { backgroundColor: surface, borderBottomColor: colors.border },
          ]}
        >
          <Text
            style={[styles.topTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {title || "Concept Builder Classes"}
          </Text>

          <View style={styles.tabsRow}>
            {tabs.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <Pressable
                  key={tab.key}
                  onPress={tab.onPress}
                  style={[
                    styles.tab,
                    active && { backgroundColor: `${brand.primary}18` },
                  ]}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? brand.primary : colors.muted },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.topRight}>
            <Pressable
              onPress={() =>
                Share.share({
                  message:
                    "Concept Builder Classes — Build Concepts, Not Just Marks",
                }).catch(() => undefined)
              }
              style={[styles.topBtn, { borderColor: colors.border }]}
            >
              <Text>🔗</Text>
            </Pressable>
          </View>
        </View>

        {/* ── CONTENT ── */}
        <View style={styles.content}>{children}</View>

        {notice && (
          <View style={[styles.toast, { backgroundColor: brand.primary }]}>
            <Text style={styles.toastText}>{notice}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", minHeight: "100%" },
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  profileName: { fontSize: 14, fontWeight: "800" },
  profileSub: { fontSize: 11 },
  divider: { height: 1, width: "100%", marginVertical: 14 },
  menuList: { gap: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuIcon: { fontSize: 17, width: 24, textAlign: "center" },
  menuLabel: { fontSize: 13, fontWeight: "600" },
  sideHeading: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 6,
  },
  socialBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  main: { flex: 1, minWidth: 0 },
  topnav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topTitle: { fontSize: 15, fontWeight: "800", minWidth: 160 },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tabIcon: { fontSize: 15 },
  tabLabel: { fontSize: 12, fontWeight: "700" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  topBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  content: { flex: 1, minHeight: 0 },

  toast: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  toastText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});

// Keeps the Dimensions import meaningful for future responsive breakpoints.
void Dimensions;
