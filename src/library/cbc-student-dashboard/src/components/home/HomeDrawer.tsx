import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

interface HomeDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export function HomeDrawer({ visible, onClose, onNavigate }: HomeDrawerProps) {
  const { colors, brand, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  const go = (screen: string) => {
    onClose();
    setTimeout(() => onNavigate(screen), 200);
  };

  const items = [
    { icon: "🏠", label: "Home", action: () => onClose() },
    { icon: "💳", label: "Purchases", action: () => go("Subscription") },
    { icon: "💬", label: "Chat", action: () => go("AskDoubtsTab") },
    { icon: "⚙️", label: "Settings", action: () => go("Settings") },
    { icon: "📈", label: "Progress Report", action: () => go("LearningAnalytics") },
    { icon: "🎁", label: "Refer & Earn", action: () => go("Support") },
    { icon: "⭐", label: "Rate", action: () => go("About") },
    { icon: "🔗", label: "Share", action: () => Share.share({ message: "Concept Builder Classes — Build Concepts, Not Just Marks" }) },
    { icon: "🎓", label: "App Tutorial", action: () => go("About") },
    { icon: "🚪", label: "Logout", action: () => logout(), danger: true },
  ];

  const socials = [
    { icon: "✈️", url: "https://t.me/" },
    { icon: "🌐", url: "https://conceptbuilderclasses.com" },
    { icon: "💬", url: "https://wa.me/" },
    { icon: "▶️", url: "https://youtube.com" },
    { icon: "📸", url: "https://instagram.com" },
    { icon: "📘", url: "https://facebook.com" },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 12,
              transform: [{ translateX: slide }],
            },
          ]}
        >
          <Image source={require("../../../assets/splash-logo.jpg")} style={[styles.logo, { borderRadius: radius.md }]} />
          <AppText variant="h3" style={{ marginTop: 12 }}>{user?.username || "Student"}</AppText>
          <AppText variant="muted" style={{ marginTop: 2 }}>Concept Builder Classes</AppText>

          <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 16 }]} />

          <View style={{ flex: 1, marginTop: 4 }}>
            {items.map((item) => (
              <Pressable key={item.label} onPress={item.action} style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}>
                <AppText style={styles.menuIcon}>{item.icon}</AppText>
                <AppText style={{ fontWeight: "600", color: item.danger ? brand.danger : colors.text }}>{item.label}</AppText>
              </Pressable>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AppText variant="h3" style={{ marginTop: 14, marginBottom: 10 }}>Follow us</AppText>
          <View style={styles.socialRow}>
            {socials.map((s, i) => (
              <Pressable
                key={i}
                onPress={() => Linking.openURL(s.url).catch(() => undefined)}
                style={[styles.socialBtn, { borderColor: colors.border, borderRadius: radius.pill }]}
              >
                <AppText>{s.icon}</AppText>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(16,24,40,0.45)" },
  drawer: { position: "absolute", left: 0, top: 0, bottom: 0, paddingHorizontal: 20 },
  logo: { width: 64, height: 64 },
  divider: { height: 1, width: "100%" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 14 },
  menuIcon: { fontSize: 20, width: 28, textAlign: "center" },
  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  socialBtn: { width: 40, height: 40, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
