import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { handwrittenNotesApi } from "@/services/resources";
import type { HandwrittenNotesSubject } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminHandwrittenNotesScreen() {
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [subjects, setSubjects] = useState<HandwrittenNotesSubject[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await handwrittenNotesApi.list({ ordering: "class_level,sort_order" });
      setSubjects(res.results);
    } catch { Alert.alert("Error", "Could not load subjects."); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = subjects.filter(
    (s) => !search.trim() || s.name.toLowerCase().includes(search.toLowerCase()) || s.class_level.toLowerCase().includes(search.toLowerCase())
  );

  const deleteSubject = (s: HandwrittenNotesSubject) => {
    Alert.alert("Delete", `Delete "${s.name}"? This will also delete all chapters and PDFs.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await handwrittenNotesApi.update(String(s.id), { is_active: false } as any);
          setSubjects((prev) => prev.filter((x) => x.id !== s.id));
        } catch { Alert.alert("Error", "Could not delete."); }
      }},
    ]);
  };

  if (isLoading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LoadingState label="Loading subjects..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>✍️ Handwritten Notes</AppText>
        <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesSubjectForm", { id: null })}
          style={[styles.addBtn, { backgroundColor: brand.primary, borderRadius: radius.md }]}>
          <AppText style={styles.addBtnText}>+ Subject</AppText>
        </Pressable>
      </View>
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search subjects..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} />
      </View>

      <FlatList data={filtered} keyExtractor={(s) => String(s.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.subjectName, { color: colors.text }]}>{item.name}</AppText>
                <AppText style={[styles.meta, { color: colors.muted }]}>{item.class_level} · {item.chapters_count ?? 0} chapters</AppText>
              </View>
              <View style={[styles.badge, { backgroundColor: item.is_active ? "#12B76A20" : "#EF444420" }]}>
                <AppText style={[styles.badgeText, { color: item.is_active ? "#12B76A" : "#EF4444" }]}>{item.is_active ? "Active" : "Off"}</AppText>
              </View>
            </View>
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesSubjectForm", { id: item.id })}
                style={[styles.actionBtn, { backgroundColor: brand.primary + "15", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: brand.primary }]}>✏️ Edit</AppText>
              </Pressable>
              <Pressable onPress={() => navigation.navigate("AdminHandwrittenNotesChapters", { subjectId: item.id, subjectName: item.name })}
                style={[styles.actionBtn, { backgroundColor: "#05966915", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: "#059669" }]}>📋 Chapters</AppText>
              </Pressable>
              <Pressable onPress={() => deleteSubject(item)}
                style={[styles.actionBtn, { backgroundColor: "#EF444415", borderRadius: radius.sm }]}>
                <AppText style={[styles.actionText, { color: "#EF4444" }]}>🗑️</AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><AppText style={{ fontSize: 32 }}>✍️</AppText><AppText style={{ color: colors.text, fontWeight: "700" }}>No subjects yet</AppText></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  subjectName: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, borderTopWidth: 1, paddingTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 7, alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
