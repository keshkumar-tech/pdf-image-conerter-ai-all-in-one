import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { useStudentClassStore } from "@/store/studentClassStore";
import { pyqApi } from "@/services/resources";
import type { PYQPaper } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PYQHub">;

const CLASS_MAP: Record<string, string> = {
  "CLASS 9th": "Class 9", "CLASS 10th": "Class 10",
  "CLASS 11th": "Class 11", "CLASS 12th": "Class 12",
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#2E90FA", Science: "#12B76A", Physics: "#F79009",
  Chemistry: "#7A5AF8", Biology: "#EF4444", English: "#0EA5E9",
  Hindi: "#EF4444", "Social Science": "#8B5CF6", "All Subjects": "#1B2B4B",
};

export default function PYQScreen({ navigation }: Props) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const currentClassLevel = CLASS_MAP[selectedClass] ?? "Class 10";

  const [allPapers, setAllPapers] = useState<PYQPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await pyqApi.list({ is_active: true, class_level: currentClassLevel });
      setAllPapers(Array.isArray(res?.results) ? res.results : []);
    } catch {
      setError("Could not load PYQ papers.");
    } finally {
      setIsLoading(false); setRefreshing(false);
    }
  }, [currentClassLevel]);

  // load on mount and whenever class changes
  useEffect(() => { load(); }, [load]);

  const filtered = allPapers.filter((p) => p.is_free === (activeTab === "free"));

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading PYQ papers..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>📄 PYQ Papers</AppText>
        <AppText style={[styles.headerSub, { color: colors.muted }]}>{currentClassLevel} · Previous Year Questions</AppText>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["free", "paid"] as const).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { borderBottomColor: brand.primary, borderBottomWidth: 2.5 }]}>
            <AppText style={[styles.tabText, { color: activeTab === tab ? brand.primary : colors.muted }]}>
              {tab === "free" ? "🆓 Free Papers" : "🔒 Premium Set"}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📄</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No papers available</AppText>
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Check back soon for {currentClassLevel} papers</AppText>
          </View>
        ) : (
          filtered.map((paper) => {
            const color = SUBJECT_COLORS[paper.subject] ?? "#1B2B4B";
            return (
              <Pressable
                key={paper.id}
                onPress={() => {
                  const url = paper.pdf || paper.pdf_url;
                  if (paper.is_free && url) {
                    navigation.navigate("PdfViewer", { title: paper.title, fileUrl: url });
                  }
                }}
                style={({ pressed }) => [
                  styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.subjectTag, { backgroundColor: color + "15" }]}>
                    <AppText style={[styles.subjectText, { color }]}>{paper.subject}</AppText>
                  </View>
                  <View style={[styles.yearTag, { backgroundColor: isDark ? "#253047" : "#F0F4FF" }]}>
                    <AppText style={[styles.yearText, { color: colors.muted }]}>{paper.year}</AppText>
                  </View>
                  {paper.is_free ? (
                    <View style={[styles.freeBadge, { backgroundColor: "#12B76A20" }]}>
                      <AppText style={styles.freeText}>🆓 Free</AppText>
                    </View>
                  ) : (
                    <View style={[styles.freeBadge, { backgroundColor: "#F7900920" }]}>
                      <AppText style={[styles.freeText, { color: "#F79009" }]}>🔒 Paid</AppText>
                    </View>
                  )}
                </View>

                <AppText style={[styles.title, { color: colors.text }]}>{paper.title}</AppText>
                <AppText style={[styles.meta, { color: colors.muted }]}>📃 {paper.pages ?? 0} pages · {paper.class_level}</AppText>

                {paper.is_free && (paper.pdf || paper.pdf_url) ? (
                  <Pressable
                    onPress={() => {
                      const url = paper.pdf || paper.pdf_url;
                      if (url) navigation.navigate("PdfViewer", { title: paper.title, fileUrl: url });
                    }}
                    style={[styles.downloadBtn, { backgroundColor: color, borderRadius: radius.md }]}
                  >
                    <AppText style={styles.downloadText}>📥 View PDF</AppText>
                  </Pressable>
                ) : !paper.is_free ? (
                  <View style={[styles.lockedRow, { backgroundColor: isDark ? "#253047" : "#F8FAFF", borderRadius: radius.md }]}>
                    <AppText style={{ fontSize: 18 }}>🔒</AppText>
                    <AppText style={[styles.lockedText, { color: colors.muted }]}>Enroll in a premium batch to unlock</AppText>
                  </View>
                ) : null}
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
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "700" },
  scroll: { padding: 12, gap: 12, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 14 },
  cardTop: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  subjectTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  subjectText: { fontSize: 11, fontWeight: "700" },
  yearTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  yearText: { fontSize: 11, fontWeight: "600" },
  freeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  freeText: { fontSize: 11, fontWeight: "700", color: "#12B76A" },
  title: { fontSize: 14, fontWeight: "700", marginBottom: 4, lineHeight: 20 },
  meta: { fontSize: 12, marginBottom: 10 },
  downloadBtn: { paddingVertical: 10, alignItems: "center" },
  downloadText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  lockedRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  lockedText: { fontSize: 12, flex: 1 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center" },
});
