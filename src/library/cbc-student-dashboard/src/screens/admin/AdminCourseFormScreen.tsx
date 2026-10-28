import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { coursesApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCourseForm">;

interface FormData {
  title: string;
  short_description: string;
  description: string;
  thumbnail_url: string;
  banner_url: string;
  instructor_name: string;
  language: string;
  level: string;
  is_free: boolean;
  is_published: boolean;
  price: string;
  discount_price: string;
}

const INITIAL: FormData = {
  title: "",
  short_description: "",
  description: "",
  thumbnail_url: "",
  banner_url: "",
  instructor_name: "Concept Builder Faculty",
  language: "Hindi",
  level: "beginner",
  is_free: false,
  is_published: false,
  price: "",
  discount_price: "",
};

const LEVELS = ["beginner", "intermediate", "advanced"];

export default function AdminCourseFormScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const isEdit = !!courseId;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const pickAndUploadImage = async (field: "thumbnail_url" | "banner_url") => {
    try {
      const res: any = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp", "image/*"],
        copyToCacheDirectory: true,
      });
      if (res?.canceled) return;
      const asset = res?.assets?.[0] ?? res;
      if (!asset?.uri) return;

      if (field === "thumbnail_url") setUploadingThumb(true);
      else setUploadingBanner(true);

      const fd = new FormData();
      fd.append("file", {
        uri: asset.uri,
        name: asset.name || "upload.jpg",
        type: asset.mimeType || "image/jpeg",
      } as any);

      const uploadRes = await apiClient.post<{ url: string }>("/courses/upload_image/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (uploadRes.data?.url) {
        set(field, uploadRes.data.url);
      }
    } catch {
      Alert.alert("Error", "Could not upload image. Please try again.");
    } finally {
      if (field === "thumbnail_url") setUploadingThumb(false);
      else setUploadingBanner(false);
    }
  };

  const load = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const course = await coursesApi.retrieve(courseId);
      setForm({
        title: course.title,
        short_description: course.short_description ?? "",
        description: course.description ?? "",
        thumbnail_url: course.thumbnail_url ?? "",
        banner_url: course.banner_url ?? "",
        instructor_name: course.instructor_name ?? "Concept Builder Faculty",
        language: course.language ?? "Hindi",
        level: course.level ?? "beginner",
        is_free: course.is_free,
        is_published: course.is_published,
        price: course.pricing_plan?.price?.toString() ?? "",
        discount_price: course.pricing_plan?.discount_price?.toString() ?? "",
      });
    } catch {
      Alert.alert("Error", "Could not load course.");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Course" : "Add Course" });
  }, [isEdit]);

  const set = (key: keyof FormData, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert("Validation", "Course title is required.");
      return;
    }
    setIsSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        thumbnail_url: form.thumbnail_url.trim(),
        banner_url: form.banner_url.trim(),
        instructor_name: form.instructor_name.trim(),
        language: form.language.trim(),
        level: form.level,
        is_free: form.is_free,
        is_published: form.is_published,
      };
      if (!form.is_free && form.price) {
        payload.pricing_plan = {
          name: `${form.title} Plan`,
          price: parseFloat(form.price),
          discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
          currency: "INR",
          features: ["Live batch", "Recorded lectures", "Notes & tests"],
        };
      }
      if (isEdit && courseId) {
        await coursesApi.update(courseId, payload);
      } else {
        await coursesApi.create(payload);
      }
      Alert.alert("Success", isEdit ? "Course updated!" : "Course created!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data).slice(0, 200)
        : "Could not save course.";
      Alert.alert("Error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading..." />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Title */}
          <AppText style={[styles.label, { color: colors.muted }]}>Course Title *</AppText>
          <TextInput
            value={form.title}
            onChangeText={(v) => set("title", v)}
            placeholder="e.g. SHAKTI BATCH 2026-27"
            placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />

          {/* Short description */}
          <AppText style={[styles.label, { color: colors.muted }]}>Short Description</AppText>
          <TextInput
            value={form.short_description}
            onChangeText={(v) => set("short_description", v)}
            placeholder="Brief description shown in listing"
            placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />

          {/* Full description */}
          <AppText style={[styles.label, { color: colors.muted }]}>Full Description</AppText>
          <TextInput
            value={form.description}
            onChangeText={(v) => set("description", v)}
            placeholder="Detailed course description..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />

          {/* Thumbnail Image Upload */}
          <AppText style={[styles.label, { color: colors.muted }]}>Course Thumbnail Image</AppText>
          <View style={[styles.imageUploadCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Pressable
                onPress={() => pickAndUploadImage("thumbnail_url")}
                disabled={uploadingThumb}
                style={[styles.uploadBtn, { backgroundColor: brand.primary + "15", borderColor: brand.primary }]}
              >
                {uploadingThumb ? (
                  <ActivityIndicator size="small" color={brand.primary} />
                ) : (
                  <AppText style={[styles.uploadBtnText, { color: brand.primary }]}>📁 Pick & Upload Thumbnail</AppText>
                )}
              </Pressable>
              {form.thumbnail_url ? (
                <Pressable onPress={() => set("thumbnail_url", "")}>
                  <AppText style={{ color: "#EF4444", fontSize: 12, fontWeight: "700" }}>Remove ✕</AppText>
                </Pressable>
              ) : null}
            </View>
            <TextInput
              value={form.thumbnail_url}
              onChangeText={(v) => set("thumbnail_url", v)}
              placeholder="Or enter image URL: https://..."
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontSize: 12 }]}
            />
            {form.thumbnail_url ? (
              <Image source={{ uri: form.thumbnail_url }} style={styles.thumbPreview} />
            ) : null}
          </View>

          {/* Banner Image Upload */}
          <AppText style={[styles.label, { color: colors.muted }]}>Course Banner Image</AppText>
          <View style={[styles.imageUploadCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Pressable
                onPress={() => pickAndUploadImage("banner_url")}
                disabled={uploadingBanner}
                style={[styles.uploadBtn, { backgroundColor: brand.primary + "15", borderColor: brand.primary }]}
              >
                {uploadingBanner ? (
                  <ActivityIndicator size="small" color={brand.primary} />
                ) : (
                  <AppText style={[styles.uploadBtnText, { color: brand.primary }]}>📁 Pick & Upload Banner</AppText>
                )}
              </Pressable>
              {form.banner_url ? (
                <Pressable onPress={() => set("banner_url", "")}>
                  <AppText style={{ color: "#EF4444", fontSize: 12, fontWeight: "700" }}>Remove ✕</AppText>
                </Pressable>
              ) : null}
            </View>
            <TextInput
              value={form.banner_url}
              onChangeText={(v) => set("banner_url", v)}
              placeholder="Or enter banner URL: https://..."
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontSize: 12 }]}
            />
            {form.banner_url ? (
              <Image source={{ uri: form.banner_url }} style={styles.bannerPreview} />
            ) : null}
          </View>

          {/* Instructor */}
          <AppText style={[styles.label, { color: colors.muted }]}>Instructor Name</AppText>
          <TextInput
            value={form.instructor_name}
            onChangeText={(v) => set("instructor_name", v)}
            placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />

          {/* Language */}
          <AppText style={[styles.label, { color: colors.muted }]}>Language</AppText>
          <TextInput
            value={form.language}
            onChangeText={(v) => set("language", v)}
            placeholderTextColor={colors.muted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />

          {/* Level */}
          <AppText style={[styles.label, { color: colors.muted }]}>Level</AppText>
          <View style={styles.chipRow}>
            {LEVELS.map((lv) => (
              <Pressable
                key={lv}
                onPress={() => set("level", lv)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, borderRadius: radius.md },
                  form.level === lv && { backgroundColor: brand.primary, borderColor: brand.primary },
                ]}
              >
                <AppText style={[styles.chipText, { color: form.level === lv ? "#fff" : colors.muted }]}>
                  {lv}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Toggles */}
          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.toggleRow}>
              <AppText style={[styles.toggleLabel, { color: colors.text }]}>🆓 Free Course</AppText>
              <Switch
                value={form.is_free}
                onValueChange={(v) => set("is_free", v)}
                trackColor={{ true: "#12B76A", false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <AppText style={[styles.toggleLabel, { color: colors.text }]}>✅ Published (Live)</AppText>
              <Switch
                value={form.is_published}
                onValueChange={(v) => set("is_published", v)}
                trackColor={{ true: brand.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Pricing — only when not free */}
          {!form.is_free && (
            <>
              <AppText style={[styles.label, { color: colors.muted }]}>MRP Price (₹)</AppText>
              <TextInput
                value={form.price}
                onChangeText={(v) => set("price", v)}
                placeholder="e.g. 3000"
                keyboardType="numeric"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              />
              <AppText style={[styles.label, { color: colors.muted }]}>Sale Price (₹)</AppText>
              <TextInput
                value={form.discount_price}
                onChangeText={(v) => set("discount_price", v)}
                placeholder="e.g. 1499"
                keyboardType="numeric"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              />
            </>
          )}

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: isSaving ? 0.7 : 1 }]}
          >
            <AppText style={styles.saveBtnText}>
              {isSaving ? "Saving..." : isEdit ? "💾 Update Course" : "✅ Create Course"}
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
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  textarea: { height: 100, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  toggleLabel: { fontSize: 14, fontWeight: "600" },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  imageUploadCard: { borderWidth: 1, padding: 12, marginTop: 4, marginBottom: 8 },
  uploadBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  uploadBtnText: { fontSize: 13, fontWeight: "700" },
  thumbPreview: { width: 90, height: 90, borderRadius: 8, marginTop: 8, resizeMode: "cover" },
  bannerPreview: { width: "100%", height: 110, borderRadius: 8, marginTop: 8, resizeMode: "cover" },
});
