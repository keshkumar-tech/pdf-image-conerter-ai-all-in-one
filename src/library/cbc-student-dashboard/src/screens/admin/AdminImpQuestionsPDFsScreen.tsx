import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { impQuestionPDFsApi } from "@/services/resources";
import type { ImpQuestionPDF } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminImpQuestionsPDFs">;
type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminImpQuestionsPDFsScreen({ route }: Props) {
  const { chapterId, subjectName } = route.params;
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [pdfs, setPdfs] = useState<ImpQuestionPDF[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await impQuestionPDFsApi.list({ chapter: chapterId, ordering: "sort_order" });
      setPdfs(res.results);
    } catch { Alert.alert("Error", "Could not load PDFs."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, [chapterId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = pdfs.filter((p) => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()));

  const deletePDF = (pdf: ImpQuestionPDF) => {
    Alert.alert("Delete", `Delete "${pdf.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await impQuestionPDFsApi.update(String(pdf.id), { is_active: false } as any);
          setPdfs((prev) => prev.filter((p) => p.id !== pdf.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading PDFs..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>📄 {subjectName ?? "Chapter"}</AppText>
          <AppText style={[styles.headerSub, { color: colors.muted }]}>{pdfs.length} PDFs</AppText>
        </View>
        <Pressable onPress={() => navigation.navigate("AdminImpQuestionsPDFForm", { chapterId, id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Add</AppText>
        </Pressable>
      </View>
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search PDFs..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} />
      </View>

      <FlatList data={filtered} keyExtractor={(p) => String(p.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.titleTxt, { color: colors.text }]} numberOfLines={2}>{item.title}</AppText>
                <AppText style={[styles.meta, { color: colors.muted }]}>
                  {item.pages > 0 ? `${item.pages} pages` : "PDF"} {item.is_free ? "· Free" : "· Paid"}
                </AppText>
              </View>
              <View style={[styles.badge, { backgroundColor: item.is_active ? "#12B76A20" : "#EF444420" }]}>
                <AppText style={[styles.badgeText, { color: item.is_active ? "#12B76A" : "#EF4444" }]}>{item.is_active ? "Active" : "Off"}</AppText>
              </View>
            </View>
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable onPress={() => navigation.navigate("AdminImpQuestionsPDFForm", { chapterId, id: item.id })}
                style={[styles.actionBtn, { backgroundColor: brand.primary + "15", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: brand.primary }]}>✏️ Edit</AppText>
              </Pressable>
              <Pressable onPress={() => deletePDF(item)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: "#EF4444" }]}>🗑️ Delete</AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>📄</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No PDFs yet</AppText></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  titleTxt: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  meta: { fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, borderTopWidth: 1, paddingTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 7, alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
