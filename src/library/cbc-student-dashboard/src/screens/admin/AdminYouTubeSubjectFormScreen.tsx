import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { youtubeSubjectsApi } from "@/services/resources";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminYouTubeSubjectForm">;
const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12"];

export default function AdminYouTubeSubjectFormScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({ subject_id: "", name: "", icon: "📚", color: "#2E90FA", class_level: "Class 10", sort_order: "0", is_active: true });
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await youtubeSubjectsApi.retrieve(String(id));
      setForm({ subject_id: data.subject_id, name: data.name, icon: data.icon, color: data.color, class_level: data.class_level, sort_order: String(data.sort_order), is_active: data.is_active });
    } catch { Alert.alert("Error", "Could not load."); navigation.goBack(); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { load(); navigation.setOptions({ title: isEdit ? "Edit Subject" : "Add Subject" }); }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.subject_id.trim() || !form.name.trim()) { Alert.alert("Validation", "Subject ID and name are required."); return; }
    setIsSaving(true);
    try {
      const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
      if (isEdit) await youtubeSubjectsApi.update(String(id), payload as any);
      else await youtubeSubjectsApi.create(payload as any);
      Alert.alert("Success", isEdit ? "Updated!" : "Created!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data ? JSON.stringify(e.response.data).slice(0, 200) : "Save failed.");
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><LoadingState label="Loading..." /></SafeAreaView>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {[["Subject ID *", "subject_id", "e.g. 10-maths"], ["Name *", "name", "Mathematics"], ["Icon (emoji)", "icon", "📚"], ["Color (hex)", "color", "#2E90FA"], ["Sort Order", "sort_order", "0"]].map(([label, key, placeholder]) => (
            <View key={key}>
              <AppText style={[styles.label, { color: colors.muted }]}>{label}</AppText>
              <TextInput value={(form as any)[key]} onChangeText={(v) => set(key, v)} placeholder={placeholder}
                placeholderTextColor={colors.muted} keyboardType={key === "sort_order" ? "numeric" : "default"}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />
            </View>
          ))}
          <AppText style={[styles.label, { color: colors.muted }]}>Class Level</AppText>
          <View style={styles.chipRow}>
            {CLASS_OPTIONS.map((cl) => (
              <Pressable key={cl} onPress={() => set("class_level", cl)}
                style={[styles.chip, { borderColor: colors.border, borderRadius: radius.md }, form.class_level === cl && { backgroundColor: brand.primary, borderColor: brand.primary }]}>
                <AppText style={{ color: form.class_level === cl ? "#fff" : colors.muted, fontSize: 12, fontWeight: "600" }}>{cl}</AppText>
              </Pressable>
            ))}
          </View>
          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.toggleRow}>
              <AppText style={[{ color: colors.text, fontSize: 14, fontWeight: "600" }]}>✅ Active</AppText>
              <Switch value={form.is_active} onValueChange={(v) => set("is_active", v)} trackColor={{ true: brand.primary, false: colors.border }} thumbColor="#fff" />
            </View>
          </View>
          <Pressable onPress={save} disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: isSaving ? 0.7 : 1 }]}>
            <AppText style={styles.saveBtnText}>{isSaving ? "Saving..." : isEdit ? "💾 Update" : "✅ Create"}</AppText>
          </Pressable>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: 16 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" }, saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
