import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { faqApi } from "@/services/resources";
import type { FAQ } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminFAQScreen() {
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await faqApi.list({ ordering: "sort_order" });
      setFaqs(res.results);
    } catch { Alert.alert("Error", "Could not load FAQs."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const deleteFAQ = (faq: FAQ) => {
    Alert.alert("Delete FAQ", `Delete this FAQ?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await faqApi.update(String(faq.id), { is_active: false } as any);
          setFaqs((p) => p.filter((f) => f.id !== faq.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>❓ FAQs ({faqs.length})</AppText>
        <Pressable onPress={() => navigation.navigate("AdminFAQForm", { id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Add</AppText>
        </Pressable>
      </View>

      <FlatList data={faqs} keyExtractor={(f) => String(f.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            {/* Question row */}
            <Pressable onPress={() => setExpanded(expanded === item.id ? null : item.id)} style={styles.questionRow}>
              <View style={[styles.orderBadge, { backgroundColor: brand.primary + "20" }]}>
                <AppText style={[styles.orderText, { color: brand.primary }]}>{item.sort_order}</AppText>
              </View>
              <AppText style={[styles.question, { color: colors.text }]} numberOfLines={expanded === item.id ? undefined : 2}>
                {item.question}
              </AppText>
              <AppText style={[styles.chevron, { color: colors.muted }]}>{expanded === item.id ? "▲" : "▼"}</AppText>
            </Pressable>

            {/* Answer (expanded) */}
            {expanded === item.id && (
              <View style={[styles.answerBox, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <AppText style={[styles.answer, { color: colors.muted }]}>{item.answer}</AppText>
              </View>
            )}

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <View style={[styles.activeBadge, { backgroundColor: item.is_active ? "#12B76A15" : "#EF444415" }]}>
                <AppText style={[styles.activeBadgeText, { color: item.is_active ? "#12B76A" : "#EF4444" }]}>
                  {item.is_active ? "✅ Active" : "❌ Hidden"}
                </AppText>
              </View>
              <View style={{ flex: 1 }} />
              <Pressable onPress={() => navigation.navigate("AdminFAQForm", { id: item.id })}
                style={[styles.actionBtn, { backgroundColor: brand.primary + "15", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: brand.primary }]}>✏️ Edit</AppText>
              </Pressable>
              <Pressable onPress={() => deleteFAQ(item)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: "#EF4444" }]}>🗑️</AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>❓</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No FAQs yet</AppText></View>}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" }, addBtn: { paddingHorizontal: 14, paddingVertical: 8 }, addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  list: { padding: 12, gap: 10, paddingBottom: 32 }, card: { borderWidth: 1 },
  questionRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  orderBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  orderText: { fontSize: 11, fontWeight: "800" }, question: { flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 18 }, chevron: { fontSize: 12 },
  answerBox: { padding: 12, borderTopWidth: 1 }, answer: { fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, padding: 8 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }, activeBadgeText: { fontSize: 11, fontWeight: "700" },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6 }, actionText: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
