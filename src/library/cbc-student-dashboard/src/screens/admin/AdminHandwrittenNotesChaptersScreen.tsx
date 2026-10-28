import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { handwrittenNoteChaptersApi, handwrittenNotePDFsApi } from "@/services/resources";
import type { HandwrittenNotesChapter, HandwrittenNotesPDF } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminHandwrittenNotesChapters">;
type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminHandwrittenNotesChaptersScreen({ route }: Props) {
  const { subjectId, subjectName } = route.params;
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [chapters, setChapters] = useState<HandwrittenNotesChapter[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await handwrittenNoteChaptersApi.list({ subject: subjectId, ordering: "order" });
      setChapters(res.results);
    } catch { Alert.alert("Error", "Could not load chapters."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, [subjectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const deleteChapter = (ch: HandwrittenNotesChapter) => {
    Alert.alert("Delete", `Delete "${ch.title}" and all its PDFs?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await handwrittenNoteChaptersApi.update(String(ch.id), { is_active: false } as any);
          setChapters((p) => p.filter((c) => c.id !== ch.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  const deletePDF = async (chapterId: number, pdfId: number) => {
    Alert.alert("Delete PDF", "Delete this PDF?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await handwrittenNotePDFsApi.update(String(pdfId), { is_active: false } as any);
          setChapters((prev) => prev.map((ch) => ch.id === chapterId
            ? { ...ch, pdfs: (ch.pdfs ?? []).filter((p) => p.id !== pdfId) } : ch));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading chapters..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <AppText style={[styles.headerTitle, { color: colors.text }]}>✍️ {subjectName}</AppText>
          <AppText style={[styles.headerSub, { color: colors.muted }]}>{chapters.length} chapters</AppText>
        </View>
        <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesChapterForm", { subjectId, id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Chapter</AppText>
        </Pressable>
      </View>

      <FlatList data={chapters} keyExtractor={(c) => String(c.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item: ch }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <Pressable onPress={() => setExpanded(expanded === ch.id ? null : ch.id)} style={styles.chapterHeader}>
              <AppText style={[styles.chapterTitle, { color: colors.text }]}>{ch.title}</AppText>
              <AppText style={[styles.pdfCount, { color: colors.muted }]}>{(ch.pdfs ?? []).length} PDFs</AppText>
              <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesChapterForm", { subjectId, id: ch.id })}
                style={[styles.smallBtn, { backgroundColor: brand.primary + "15", borderRadius: 6 }]}>
                <AppText style={[{ color: brand.primary, fontSize: 11, fontWeight: "700" }]}>✏️</AppText>
              </Pressable>
              <Pressable onPress={() => deleteChapter(ch)}
                style={[styles.smallBtn, { backgroundColor: "#EF444415", borderRadius: 6 }]}>
                <AppText style={[{ color: "#EF4444", fontSize: 11, fontWeight: "700" }]}>🗑️</AppText>
              </Pressable>
              <AppText style={[{ color: colors.muted, fontSize: 12 }]}>{expanded === ch.id ? "▲" : "▼"}</AppText>
            </Pressable>

            {expanded === ch.id && (
              <>
                {(ch.pdfs ?? []).map((pdf) => (
                  <View key={pdf.id} style={[styles.pdfRow, { borderTopColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.pdfTitle, { color: colors.text }]} numberOfLines={1}>{pdf.title}</AppText>
                      <AppText style={[styles.pdfMeta, { color: colors.muted }]}>
                        {pdf.pages > 0 ? `${pdf.pages} pages` : "PDF"} {pdf.is_free ? "· Free" : "· Paid"}
                      </AppText>
                    </View>
                    <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesPDFForm", { chapterId: ch.id, id: pdf.id })}
                      style={[styles.smallBtn, { backgroundColor: brand.primary + "15", borderRadius: 6 }]}>
                      <AppText style={{ color: brand.primary, fontSize: 11, fontWeight: "700" }}>✏️</AppText>
                    </Pressable>
                    <Pressable onPress={() => deletePDF(ch.id, pdf.id)}
                      style={[styles.smallBtn, { backgroundColor: "#EF444415", borderRadius: 6 }]}>
                      <AppText style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>🗑️</AppText>
                    </Pressable>
                  </View>
                ))}
                <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesPDFForm", { chapterId: ch.id, id: null })}
                  style={[styles.addPdfBtn, { borderColor: brand.primary, borderRadius: radius.md }]}>
                  <AppText style={[{ color: brand.primary, fontWeight: "700", fontSize: 13 }]}>+ Add PDF / Note</AppText>
                </Pressable>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>📋</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No chapters yet</AppText></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 1 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  card: { borderWidth: 1, overflow: "hidden" },
  chapterHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  chapterTitle: { flex: 1, fontSize: 13, fontWeight: "700" },
  pdfCount: { fontSize: 11 },
  smallBtn: { paddingHorizontal: 7, paddingVertical: 4 },
  pdfRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1 },
  pdfTitle: { fontSize: 12, fontWeight: "600" },
  pdfMeta: { fontSize: 10, marginTop: 1 },
  addPdfBtn: { margin: 10, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderStyle: "dashed" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
