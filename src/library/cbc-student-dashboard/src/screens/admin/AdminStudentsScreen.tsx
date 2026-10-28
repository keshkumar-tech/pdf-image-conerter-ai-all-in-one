import { useCallback, useState } from "react";
import {
  Alert, FlatList, Pressable, RefreshControl,
  StyleSheet, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface Student {
  id: string;
  email: string;
  username: string;
  phone: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  last_active_at: string | null;
  role: { key: string; label: string } | null;
  profile: { full_name: string | null; city: string | null } | null;
}

interface PagedResponse {
  count: number;
  results: Student[];
}

export default function AdminStudentsScreen() {
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [students, setStudents] = useState<Student[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false, q = "") => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const params: Record<string, string> = {
        role__key: "student",
        ordering: "-created_at",
      };
      if (q.trim()) params.search = q.trim();
      const res = await apiClient.get<PagedResponse>("/users/", { params });
      setStudents(res.data.results);
      setCount(res.data.count);
    } catch {
      Alert.alert("Error", "Could not load students.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSearch = (text: string) => {
    setSearch(text);
    load(false, text);
  };

  const toggleActive = async (student: Student) => {
    const action = student.is_active ? "Deactivate" : "Activate";
    Alert.alert(
      `${action} Student`,
      `${action} account for ${student.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: student.is_active ? "destructive" : "default",
          onPress: async () => {
            try {
              await apiClient.patch(`/users/${student.id}/`, { is_active: !student.is_active });
              setStudents((prev) =>
                prev.map((s) => s.id === student.id ? { ...s, is_active: !s.is_active } : s)
              );
            } catch {
              Alert.alert("Error", "Could not update student.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading students..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>👨‍🎓 Students</AppText>
        <View style={[styles.countBadge, { backgroundColor: brand.primary + "20" }]}>
          <AppText style={[styles.countText, { color: brand.primary }]}>{count} total</AppText>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search by name, email, phone..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
        />
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true, search)} tintColor={brand.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: s }) => (
          <Pressable
            onPress={() => navigation.navigate("AdminStudentDetail", { userId: s.id })}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
          >
            {/* Avatar + name */}
            <View style={styles.cardRow}>
              <View style={[styles.avatar, { backgroundColor: brand.primary + "20" }]}>
                <AppText style={[styles.avatarText, { color: brand.primary }]}>
                  {(s.profile?.full_name ?? s.username ?? "?")[0].toUpperCase()}
                </AppText>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText style={[styles.name, { color: colors.text }]}>
                  {s.profile?.full_name ?? s.username}
                </AppText>
                <AppText style={[styles.email, { color: colors.muted }]} numberOfLines={1}>
                  {s.email}
                </AppText>
                {!!s.phone && (
                  <AppText style={[styles.phone, { color: colors.muted }]}>📱 {s.phone}</AppText>
                )}
              </View>
              {/* Status */}
              <View style={[
                styles.statusBadge,
                { backgroundColor: s.is_active ? "#12B76A20" : "#EF444420" },
              ]}>
                <AppText style={[styles.statusText, { color: s.is_active ? "#12B76A" : "#EF4444" }]}>
                  {s.is_active ? "Active" : "Inactive"}
                </AppText>
              </View>
            </View>

            {/* Meta row */}
            <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
              <AppText style={[styles.metaText, { color: colors.muted }]}>
                {s.is_email_verified ? "✅ Verified" : "⚠️ Unverified"}
              </AppText>
              {!!s.profile?.city && (
                <AppText style={[styles.metaText, { color: colors.muted }]}>
                  📍 {s.profile.city}
                </AppText>
              )}
              <Pressable
                onPress={() => toggleActive(s)}
                style={[styles.actionBtn, {
                  backgroundColor: s.is_active ? "#EF444415" : "#12B76A15",
                  borderRadius: radius.sm,
                }]}
              >
                <AppText style={[styles.actionText, { color: s.is_active ? "#EF4444" : "#12B76A" }]}>
                  {s.is_active ? "Deactivate" : "Activate"}
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>👨‍🎓</AppText>
            <AppText style={[styles.emptyText, { color: colors.text }]}>No students found</AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: "700" },
  searchWrap: {
    paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1,
  },
  searchInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 14,
  },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 12 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800" },
  name: { fontSize: 14, fontWeight: "700" },
  email: { fontSize: 12, marginTop: 2 },
  phone: { fontSize: 12, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  metaRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderTopWidth: 1, marginTop: 10, paddingTop: 8,
  },
  metaText: { fontSize: 11 },
  actionBtn: { marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 5 },
  actionText: { fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
});
