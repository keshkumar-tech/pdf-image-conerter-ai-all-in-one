import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { faqApi } from "@/services/resources";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminFAQForm">;

export default function AdminFAQFormScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({ question: "", answer: "", sort_order: "0", is_active: true });
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const d = await faqApi.retrieve(String(id));
      setForm({ question: d.question, answer: d.answer, sort_order: String(d.sort_order), is_active: d.is_active });
    } catch { Alert.alert("Error", "Could not load."); navigation.goBack(); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { load(); navigation.setOptions({ title: isEdit ? "Edit FAQ" : "Add FAQ" }); }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) { Alert.alert("Validation", "Question and Answer are required."); return; }
    setIsSaving(true);
    try {
      const payload = { question: form.question.trim(), answer: form.answer.trim(), sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active };
      if (isEdit) await faqApi.update(String(id), payload as any);
      else await faqApi.create(payload as any);
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

          <AppText style={[styles.label, { color: colors.muted }]}>Question *</AppText>
          <TextInput value={form.question} onChangeText={(v) => set("question", v)}
            placeholder="e.g. What is Concept Builder Classes?"
            placeholderTextColor={colors.muted} multiline numberOfLines={3}
            style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />

          <AppText style={[styles.label, { color: colors.muted }]}>Answer *</AppText>
          <TextInput value={form.answer} onChangeText={(v) => set("answer", v)}
            placeholder="Detailed answer..."
            placeholderTextColor={colors.muted} multiline numberOfLines={5}
            style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, height: 120 }]} />

          <AppText style={[styles.label, { color: colors.muted }]}>Sort Order</AppText>
          <TextInput value={form.sort_order} onChangeText={(v) => set("sort_order", v)}
            placeholder="0" keyboardType="numeric" placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />

          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.toggleRow}>
              <AppText style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>✅ Active (shown to students)</AppText>
              <Switch value={form.is_active} onValueChange={(v) => set("is_active", v)} trackColor={{ true: brand.primary, false: colors.border }} thumbColor="#fff" />
            </View>
          </View>

          <Pressable onPress={save} disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: isSaving ? 0.7 : 1 }]}>
            <AppText style={styles.saveBtnText}>{isSaving ? "Saving..." : isEdit ? "💾 Update FAQ" : "✅ Create FAQ"}</AppText>
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
  textarea: { textAlignVertical: "top", height: 80 },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" }, saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
