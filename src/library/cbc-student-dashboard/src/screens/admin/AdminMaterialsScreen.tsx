import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { materialsApi } from "@/services/resources";
import type { MaterialCategory, StudyMaterial } from "@/services/types";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Props = NativeStackScreenProps<AdminStackParamList, "AdminMaterials">;

export default function AdminMaterialsScreen({ route }: Props) {
  const { category, title } = route.params;
  const { colors, brand, radius } = useTheme();
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);
      try {
        const res = await materialsApi.list({
          category,
          ordering: "class_level,sort_order",
        });
        setItems(res.results);
      } catch {
        Alert.alert("Error", "Could not load items.");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [category],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = items.filter(
    (m) =>
      !search.trim() || m.title.toLowerCase().includes(search.toLowerCase()),
  );

  const deleteItem = (item: StudyMaterial) => {
    Alert.alert("Delete", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await materialsApi.update(String(item.id), {
              is_active: false,
            } as any);
            setItems((prev) => prev.filter((m) => m.id !== item.id));
          } catch {
            Alert.alert("Error", "Could not delete.");
          }
        },
      },
    ]);
  };

  if (isLoading)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingState label="Loading..." />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <AppText style={[styles.headerTitle, { color: colors.text }]}>
          {title}
        </AppText>
        <Pressable
          onPress={() =>
            navigation.navigate("AdminMaterialForm", {
              id: null,
              category,
              title,
            })
          }
          style={[
            styles.addBtn,
            { backgroundColor: brand.primary, borderRadius: radius.md },
          ]}
        >
          <AppText style={styles.addBtnText}>+ Add</AppText>
        </Pressable>
      </View>
      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search..."
          placeholderTextColor={colors.muted}
          style={[
            styles.searchInput,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background,
            },
          ]}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(m) => String(m.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={brand.primary}
          />
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <AppText
                  style={[styles.titleTxt, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </AppText>
                <AppText style={[styles.meta, { color: colors.muted }]}>
                  {item.class_level}
                  {item.subject && item.subject !== "All Subjects"
                    ? ` · ${item.subject}`
                    : ""}
                  {item.pdf ? " · 📎 PDF" : ""}
                </AppText>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.border }]}>
                <AppText style={[styles.badgeText, { color: colors.muted }]}>
                  {item.is_active ? "Active" : "Hidden"}
                </AppText>
              </View>
            </View>
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <Pressable
                onPress={() =>
                  navigation.navigate("AdminMaterialForm", {
                    id: item.id,
                    category,
                    title,
                  })
                }
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: brand.primary + "15",
                    borderRadius: radius.sm,
                  },
                ]}
              >
                <AppText style={[styles.actionText, { color: brand.primary }]}>
                  ✏️ Edit
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => deleteItem(item)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: "#EF444415", borderRadius: radius.sm },
                ]}
              >
                <AppText style={[styles.actionText, { color: "#EF4444" }]}>
                  🗑️ Delete
                </AppText>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText style={{ fontSize: 32 }}>📁</AppText>
            <AppText style={{ color: colors.text, fontWeight: "700" }}>
              No items yet
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchWrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 12 },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  titleTxt: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  meta: { fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, borderTopWidth: 1, paddingTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 7, alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
});
