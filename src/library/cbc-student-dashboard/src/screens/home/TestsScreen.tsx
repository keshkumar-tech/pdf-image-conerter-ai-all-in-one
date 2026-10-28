import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { useStudentClassStore } from "@/store/studentClassStore";
import { materialsApi } from "@/services/resources";
import type { StudyMaterial } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Tests">;

type Tab = "free" | "paid";

const CLASS_MAP: Record<string, string> = {
  "CLASS 9th": "Class 9", "CLASS 10th": "Class 10",
  "CLASS 11th": "Class 11", "CLASS 12th": "Class 12",
};

export default function TestsScreen({ navigation }: Props) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";
  const selectedClass = useStudentClassStore((s) => s.selectedClass);
  const currentClassLevel = CLASS_MAP[selectedClass] ?? "Class 10";

  const [activeTab, setActiveTab] = useState<Tab>("free");
  const [items, setItems] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = activeTab === "free" ? "free-test" : "paid-test";

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await materialsApi.list({ category, is_active: true });
      const mappedClass = CLASS_MAP[selectedClass] ?? "";
      const rows = (res.results ?? []).filter(
        (m) => !mappedClass || m.class_level === mappedClass,
      );
      setItems(rows);
      setError(null);
    } catch {
      setError("Could not load tests.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [category, selectedClass]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>📝 Tests</AppText>
        <AppText style={[styles.headerSub, { color: colors.muted }]}>
          {currentClassLevel} — Chapter-wise & mock tests
        </AppText>
      </View>

      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["free", "paid"] as const).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && { borderBottomColor: brand.primary, borderBottomWidth: 2.5 }]}>
            <AppText style={[styles.tabText, { color: activeTab === tab ? brand.primary : colors.muted }]}>
              {tab === "free" ? "🆓 Free Tests" : "🔒 Premium Set"}
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
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📝</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No tests available</AppText>
            <AppText style={[styles.emptySub, { color: colors.muted }]}>Check back soon for {currentClassLevel}</AppText>
          </View>
        ) : (
          items.map((item) => {
            const url = item.pdf || item.file_url;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (!url) return;
                  navigation.navigate("PdfViewer", { title: item.title, fileUrl: url });
                }}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
              >
                <AppText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText style={[styles.meta, { color: colors.muted }]}>
                  {item.class_level}{item.subject && item.subject !== "All Subjects" ? ` · ${item.subject}` : ""}
                </AppText>
                {!!url && (
                  <View style={[styles.openBtn, { backgroundColor: brand.primary }]}>
                    <AppText style={styles.openText}>📥 Open</AppText>
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
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "700" },
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
