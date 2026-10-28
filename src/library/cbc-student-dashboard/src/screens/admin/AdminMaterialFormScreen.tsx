import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { materialsApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminMaterialForm">;

const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12"];
const SUBJECT_OPTIONS = [
  "All Subjects",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
];

export default function AdminMaterialFormScreen({ route, navigation }: Props) {
  const { id, category, title } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({
    title: "",
    subject: "All Subjects",
    class_level: "Class 10",
    description: "",
    sort_order: "0",
    is_active: true,
  });
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
  } | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await materialsApi.retrieve(String(id));
      setForm({
        title: data.title,
        subject: data.subject,
        class_level: data.class_level,
        description: data.description ?? "",
        sort_order: String(data.sort_order),
        is_active: data.is_active,
      });
      const pdfData = (data as any).pdf;
      if (pdfData) {
        const name = pdfData.split("/").pop() || "existing.pdf";
        setExistingFileName(decodeURIComponent(name));
      }
    } catch {
      Alert.alert("Error", "Could not load.");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    navigation.setOptions({ title: isEdit ? `Edit ${title}` : `Add ${title}` });
  }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const pickPdf = async () => {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (res?.canceled) return;
      const asset = res?.assets?.[0] ?? res; // SDK 51+ uses assets, older returns flat
      if (asset?.uri)
        setPickedFile({ uri: asset.uri, name: asset.name ?? "upload.pdf" });
    } catch {
      Alert.alert("Error", "Could not pick PDF.");
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }
    setIsSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        category,
        subject: form.subject,
        class_level: form.class_level,
        description: form.description.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
      };
      let res;
      if (pickedFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
        fd.append("file", {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: "application/pdf",
        } as any);
        if (isEdit && id) {
          res = await apiClient.patch(`/content/materials/${id}/`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await apiClient.post("/content/materials/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else if (isEdit && id) {
        res = await materialsApi.update(String(id), payload);
      } else {
        res = await materialsApi.create(payload);
      }
      void res;
      Alert.alert("Success", isEdit ? "Updated!" : "Created!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data
          ? JSON.stringify(e.response.data).slice(0, 300)
          : "Save failed.",
      );
    } finally {
      setIsSaving(false);
    }
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
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <AppText style={[styles.label, { color: colors.muted }]}>
            Title *
          </AppText>
          <TextInput
            value={form.title}
            onChangeText={(v) => set("title", v)}
            placeholder="e.g. NCERT Science Book / Mock Test 1"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
          />

          <AppText style={[styles.label, { color: colors.muted }]}>
            Description
          </AppText>
          <TextInput
            value={form.description}
            onChangeText={(v) => set("description", v)}
            placeholder="Short description"
            placeholderTextColor={colors.muted}
            multiline
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
                minHeight: 70,
                textAlignVertical: "top",
              },
            ]}
          />

          <AppText style={[styles.label, { color: colors.muted }]}>
            Class Level
          </AppText>
          <View style={styles.chipRow}>
            {CLASS_OPTIONS.map((cl) => (
              <Pressable
                key={cl}
                onPress={() => set("class_level", cl)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, borderRadius: radius.md },
                  form.class_level === cl && {
                    backgroundColor: brand.primary,
                    borderColor: brand.primary,
                  },
                ]}
              >
                <AppText
                  style={{
                    color: form.class_level === cl ? "#fff" : colors.muted,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {cl}
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText style={[styles.label, { color: colors.muted }]}>
            Subject
          </AppText>
          <View style={styles.chipRow}>
            {SUBJECT_OPTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => set("subject", s)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, borderRadius: radius.md },
                  form.subject === s && {
                    backgroundColor: brand.primary,
                    borderColor: brand.primary,
                  },
                ]}
              >
                <AppText
                  style={{
                    color: form.subject === s ? "#fff" : colors.muted,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {s}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* PDF Upload from phone */}
          <AppText style={[styles.label, { color: colors.muted }]}>
            📄 PDF File (phone se upload karo)
          </AppText>
          {existingFileName && !pickedFile && (
            <AppText style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>
              Current file: {existingFileName}
            </AppText>
          )}
          <Pressable
            onPress={pickPdf}
            style={[
              styles.uploadBtn,
              {
                borderColor: brand.primary,
                borderRadius: radius.md,
                backgroundColor: brand.primary + "10",
              },
            ]}
          >
            <AppText
              style={{ color: brand.primary, fontWeight: "700", fontSize: 13 }}
            >
              {pickedFile
                ? `📎 ${pickedFile.name}`
                : existingFileName
                  ? `🔄 Replace PDF (current: ${existingFileName})`
                  : "📤 Choose PDF from Phone"}
            </AppText>
          </Pressable>

          <View
            style={[
              styles.toggleCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={styles.toggleRow}>
              <AppText style={[styles.toggleLabel, { color: colors.text }]}>
                ✅ Active
              </AppText>
              <Switch
                value={form.is_active}
                onValueChange={(v) => set("is_active", v)}
                trackColor={{ true: brand.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <Pressable
            onPress={save}
            disabled={isSaving}
            style={[
              styles.saveBtn,
              {
                backgroundColor: brand.primary,
                borderRadius: radius.lg,
                opacity: isSaving ? 0.7 : 1,
              },
            ]}
          >
            <AppText style={styles.saveBtnText}>
              {isSaving ? "Saving..." : isEdit ? "💾 Update" : "✅ Create"}
            </AppText>
          </Pressable>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  uploadBtn: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 16,
    alignItems: "center",
  },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleLabel: { fontSize: 14, fontWeight: "600" },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
