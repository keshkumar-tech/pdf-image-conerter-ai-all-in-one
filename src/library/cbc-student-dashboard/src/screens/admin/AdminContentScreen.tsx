import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const CONTENT_ITEMS = [
  { icon: "📄", label: "PYQ Papers",    sub: "Add/edit previous year question papers",  screen: "AdminPYQ"         },
  { icon: "🧠", label: "Quizzes",       sub: "View all lesson quizzes & mock tests",     screen: "AdminQuizzes"     },
  { icon: "📕", label: "NCERT Books",   sub: "Upload NCERT book PDFs",                   screen: "AdminMaterialsNCERT"   },
  { icon: "📝", label: "Paid Tests",    sub: "Upload paid test series PDFs",             screen: "AdminMaterialsPaidTest" },
  { icon: "✏️", label: "Free Tests",    sub: "Upload free test PDFs",                    screen: "AdminMaterialsFreeTest" },
  { icon: "📋", label: "Paid Notes",    sub: "Upload paid notes PDFs",                   screen: "AdminMaterialsPaidNotes"},
  { icon: "🆓", label: "Free Notes",    sub: "Upload free notes PDFs",                   screen: "AdminMaterialsFreeNotes"},
  { icon: "✍️", label: "Handwritten Notes", sub: "Manage handwritten notes subjects, chapters & PDFs", screen: "AdminHandwrittenNotes" },
  { icon: "⭐", label: "Important Questions", sub: "Manage important questions subjects, chapters & PDFs", screen: "AdminImpQuestions" },
  { icon: "▶️", label: "YouTube Videos", sub: "Manage YouTube subjects, chapters & videos", screen: "AdminYouTube"  },
  { icon: "🔗", label: "Social Links",  sub: "Update YouTube, Instagram, WhatsApp links",   screen: "AdminSocialLinks"},
  { icon: "❓", label: "FAQs",          sub: "Manage frequently asked questions",            screen: "AdminFAQ"       },
  { icon: "🔔", label: "Notifications", sub: "Send push notifications to students",          screen: "AdminNotifications"},
  { icon: "🎟️", label: "Coupons",       sub: "Create & manage discount coupons",             screen: "AdminCoupons"   },
] as const;

const MATERIAL_ROUTES: Record<string, { category: string; title: string }> = {
  AdminMaterialsNCERT:    { category: "ncert",      title: "NCERT Book" },
  AdminMaterialsPaidTest: { category: "paid-test",  title: "Paid Test" },
  AdminMaterialsFreeTest: { category: "free-test",  title: "Free Test" },
  AdminMaterialsPaidNotes:{ category: "paid-notes", title: "Paid Notes" },
  AdminMaterialsFreeNotes:{ category: "free-notes", title: "Free Notes" },
};

export default function AdminContentScreen() {
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>📋 Content Manager</AppText>
        <AppText style={[styles.headerSub, { color: colors.muted }]}>Manage all dynamic content from here</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          {CONTENT_ITEMS.map(({ icon, label, sub, screen }, idx) => (
            <Pressable
              key={screen}
              onPress={() => {
                const mat = MATERIAL_ROUTES[screen];
                if (mat) navigation.navigate("AdminMaterials", mat as any);
                else navigation.navigate(screen as any);
              }}
              style={({ pressed }) => [
                styles.row,
                idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: brand.primary + "15" }]}>
                <AppText style={styles.icon}>{icon}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.label, { color: colors.text }]}>{label}</AppText>
                <AppText style={[styles.sub, { color: colors.muted }]}>{sub}</AppText>
              </View>
              <AppText style={[styles.arrow, { color: colors.muted }]}>›</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  scroll: { padding: 16 },
  card: { borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  label: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2 },
  arrow: { fontSize: 22 },
});
