import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { handwrittenNotePDFsApi } from "@/services/resources";
import type { HandwrittenNotesPDF } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "HandwrittenNotePDFs">;

export default function HandwrittenNotePDFsScreen({ route, navigation }: Props) {
  const { chapter: chapterId, subjectName } = route.params;
  const { colors, brand, radius } = useTheme();

  const [pdfs, setPdfs] = useState<HandwrittenNotesPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await handwrittenNotePDFsApi.list({ chapter: chapterId, is_active: true });
      setPdfs(res.results);
    } catch {
      setError("Could not load PDFs.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [chapterId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    navigation.setOptions({ title: subjectName ? `✍️ ${subjectName}` : "Handwritten Notes" });
  }, [navigation, subjectName]);

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading PDFs..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : pdfs.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📄</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No PDFs yet</AppText>
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Coming soon!</AppText>
          </View>
        ) : (
          pdfs.map((pdf) => {
            const url = pdf.pdf || pdf.pdf_url;
            return (
              <Pressable
                key={pdf.id}
                onPress={() => {
                  if (!url) return;
                  navigation.navigate("PdfViewer", { title: pdf.title, fileUrl: url });
                }}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
              >
                <AppText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                  {pdf.title}
                </AppText>
                <AppText style={[styles.meta, { color: colors.muted }]}>
                  {pdf.pages > 0 ? `${pdf.pages} pages` : "PDF"}
                  {pdf.is_free ? " · 🆓 Free" : " · 🔒 Paid"}
                </AppText>
                {!!url && (
                  <View style={[styles.openBtn, { backgroundColor: "#059669" }]}>
                    <AppText style={styles.openText}>📥 View PDF</AppText>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 12, gap: 12, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 14, gap: 6 },
  title: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  meta: { fontSize: 12 },
  openBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  openText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center" },
});
