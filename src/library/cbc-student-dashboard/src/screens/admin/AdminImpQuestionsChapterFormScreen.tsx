import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { impQuestionChaptersApi } from "@/services/resources";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminImpQuestionsChapterForm">;

export default function AdminImpQuestionsChapterFormScreen({ route, navigation }: Props) {
  const { subjectId, id } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({ title: "", order: "0", is_active: true });
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await impQuestionChaptersApi.retrieve(String(id));
      setForm({ title: data.title, order: String(data.order), is_active: data.is_active });
    } catch { Alert.alert("Error", "Could not load."); navigation.goBack(); }
    finally { setIsLoading(false); }
  }, [id, navigation]);

  useEffect(() => { load(); navigation.setOptions({ title: isEdit ? "Edit Chapter" : "Add Chapter" }); }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) { Alert.alert("Validation", "Title is required."); return; }
    setIsSaving(true);
    try {
      const payload = { subject: subjectId, title: form.title.trim(), order: parseInt(form.order) || 0, is_active: form.is_active };
      if (isEdit) await impQuestionChaptersApi.update(String(id), payload as any);
      else await impQuestionChaptersApi.create(payload as any);
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
          {[["Title *", "title", "e.g. Chapter 1 — Real Numbers"], ["Order", "order", "0"]].map(([label, key, placeholder]) => (
            <View key={key}>
              <AppText style={[styles.label, { color: colors.muted }]}>{label}</AppText>
              <TextInput value={(form as any)[key]} onChangeText={(v) => set(key, v)} placeholder={placeholder}
                placeholderTextColor={colors.muted} keyboardType={key === "order" ? "numeric" : "default"}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />
            </View>
          ))}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
