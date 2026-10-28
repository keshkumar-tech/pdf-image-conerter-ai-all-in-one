import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { pyqApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminPYQForm">;

const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12"];
const SUBJECT_OPTIONS = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "All Subjects"];

export default function AdminPYQFormScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({ title: "", subject: "Mathematics", year: "", class_level: "Class 10", pages: "", is_free: false, sort_order: "0", is_active: true });
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string } | null>(null);
  const [existingPdfName, setExistingPdfName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await pyqApi.retrieve(String(id));
      setForm({ title: data.title, subject: data.subject, year: data.year, class_level: data.class_level, pages: String(data.pages), is_free: data.is_free, sort_order: String(data.sort_order), is_active: data.is_active });
      const pdfData = (data as any).pdf;
      if (pdfData) {
        const name = pdfData.split("/").pop() || "existing.pdf";
        setExistingPdfName(decodeURIComponent(name));
      }
    } catch { Alert.alert("Error", "Could not load."); navigation.goBack(); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { load(); navigation.setOptions({ title: isEdit ? "Edit PYQ" : "Add PYQ" }); }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const pickPdf = async () => {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
      if (res?.canceled) return;
      const asset = res?.assets?.[0] ?? res;
      if (asset?.uri) setPickedFile({ uri: asset.uri, name: asset.name ?? "pyq.pdf" });
    } catch { Alert.alert("Error", "Could not pick PDF."); }
  };

  const save = async () => {
    if (!form.title.trim() || !form.year.trim()) { Alert.alert("Validation", "Title and year are required."); return; }
    setIsSaving(true);
    try {
      const payload = { ...form, pages: parseInt(form.pages) || 0, sort_order: parseInt(form.sort_order) || 0 };
      if (pickedFile) {
        // Multipart upload with PDF from phone
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
        // @ts-ignore RN FormData file shape
        fd.append("pdf_file", { uri: pickedFile.uri, name: pickedFile.name, type: "application/pdf" });
        if (isEdit && id) await apiClient.patch(`/content/pyq/${id}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        else await apiClient.post("/content/pyq/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else if (isEdit) await pyqApi.update(String(id), payload as any);
      else await pyqApi.create(payload as any);
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
          {[["Title *", "title", "e.g. Class 10 Science PYQ 2023"], ["Year *", "year", "e.g. 2023 or 2018–2023"], ["Pages", "pages", "24"], ["Sort Order", "sort_order", "0"]].map(([label, key, placeholder]) => (
            <View key={key}>
              <AppText style={[styles.label, { color: colors.muted }]}>{label}</AppText>
              <TextInput value={(form as any)[key]} onChangeText={(v) => set(key, v)} placeholder={placeholder}
                placeholderTextColor={colors.muted} keyboardType={key === "pages" || key === "sort_order" ? "numeric" : "default"}
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

          <AppText style={[styles.label, { color: colors.muted }]}>Subject</AppText>
          <View style={styles.chipRow}>
            {SUBJECT_OPTIONS.map((s) => (
              <Pressable key={s} onPress={() => set("subject", s)}
                style={[styles.chip, { borderColor: colors.border, borderRadius: radius.md }, form.subject === s && { backgroundColor: brand.primary, borderColor: brand.primary }]}>
                <AppText style={{ color: form.subject === s ? "#fff" : colors.muted, fontSize: 11, fontWeight: "600" }}>{s}</AppText>
              </Pressable>
            ))}
          </View>

          {/* PDF Upload from phone */}
          <AppText style={[styles.label, { color: colors.muted }]}>📄 PDF Upload (phone se)</AppText>
          {existingPdfName && !pickedFile && (
            <AppText style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>
              Current file: {existingPdfName}
            </AppText>
          )}
          <Pressable onPress={pickPdf}
            style={[styles.uploadBtn, { borderColor: brand.primary, borderRadius: radius.md, backgroundColor: brand.primary + "10" }]}>
            <AppText style={{ color: brand.primary, fontWeight: "700", fontSize: 13 }}>
              {pickedFile ? `📎 ${pickedFile.name}` : existingPdfName ? `🔄 Replace PDF (current: ${existingPdfName})` : "📤 Choose PDF from Phone"}
            </AppText>
          </Pressable>

          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            {[["🆓 Free Paper", "is_free"], ["✅ Active", "is_active"]].map(([lbl, key], idx) => (
              <View key={key} style={[styles.toggleRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <AppText style={[styles.toggleLabel, { color: colors.text }]}>{lbl}</AppText>
                <Switch value={(form as any)[key]} onValueChange={(v) => set(key, v)} trackColor={{ true: brand.primary, false: colors.border }} thumbColor="#fff" />
              </View>
            ))}
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  uploadBtn: { borderWidth: 1.5, borderStyle: "dashed", paddingVertical: 16, alignItems: "center" },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  toggleLabel: { fontSize: 14, fontWeight: "600" },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" }, saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
