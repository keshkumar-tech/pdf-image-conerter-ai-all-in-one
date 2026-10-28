import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { youtubeVideosApi } from "@/services/resources";
import type { AdminStackParamList } from "@/navigation/adminTypes";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminYouTubeVideoForm">;

const extractVideoId = (input: string): string | null => {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/(?:embed|shorts|live)\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m) return m[1];
  }
  return null;
};

const formatDuration = (total: number): string => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function AdminYouTubeVideoFormScreen({ route, navigation }: Props) {
  const { chapterId, id } = route.params;
  const isEdit = id !== null;
  const { colors, brand, radius } = useTheme();
  const [form, setForm] = useState({ title: "", video_id: "", duration: "", order: "0", is_active: true });
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const autoFetchedFor = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await youtubeVideosApi.retrieve(String(id));
      setForm({ title: data.title, video_id: data.video_id, duration: data.duration ?? "", order: String(data.order), is_active: data.is_active });
    } catch { Alert.alert("Error", "Could not load."); navigation.goBack(); }
    finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { load(); navigation.setOptions({ title: isEdit ? "Edit Video" : "Add Video" }); }, []);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleFetchMeta = async () => {
    const vid = extractVideoId(form.video_id);
    if (!vid) {
      Alert.alert("Invalid URL", "Ye YouTube link/ID valid nahi lag raha. Pura link paste karo (youtube.com/watch?v=... ya youtu.be/...).");
      return;
    }
    setIsFetching(true);
    try {
      let fetchedTitle = "";
      try {
        const oRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${vid}`)}&format=json`);
        if (oRes.ok) {
          const j = await oRes.json();
          if (j && typeof j.title === "string") fetchedTitle = j.title;
        }
      } catch {}
      let seconds = 0;
      try {
        const wRes = await fetch(`https://www.youtube.com/watch?v=${vid}`, { headers: { "Accept-Language": "en-US,en;q=0.9" } });
        const html = await wRes.text();
        const mSec = html.match(/"lengthSeconds":"(\d+)"/);
        const mMs = html.match(/"approxDurationMs":"(\d+)"/);
        if (mSec) seconds = parseInt(mSec[1], 10);
        else if (mMs) seconds = Math.round(parseInt(mMs[1], 10) / 1000);
      } catch {}
      setForm((p) => ({
        ...p,
        video_id: vid,
        title: fetchedTitle || p.title,
        duration: seconds ? formatDuration(seconds) : p.duration,
      }));
      if (!fetchedTitle && !seconds) Alert.alert("Fetch failed", "Video info fetch nahi ho payi. Title aur duration manually bhar do.");
      else if (!seconds) Alert.alert("Partial", "Title fetch ho gaya, par duration nahi mila — manually bhar sakte ho.");
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch title/duration when a full YouTube URL is pasted
  useEffect(() => {
    const raw = form.video_id.trim();
    if (!raw || /^[a-zA-Z0-9_-]{11}$/.test(raw)) return;
    if (autoFetchedFor.current === raw) return;
    const t: ReturnType<typeof setTimeout> = setTimeout(() => {
      autoFetchedFor.current = raw;
      handleFetchMeta();
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.video_id]);

  const save = async () => {
    const vid = extractVideoId(form.video_id);
    if (!form.title.trim() || !vid) { Alert.alert("Validation", "Valid YouTube URL/Video ID aur Title dono zaroori hain."); return; }
    setIsSaving(true);
    try {
      const payload = { chapter: chapterId, title: form.title.trim(), video_id: vid, duration: form.duration.trim(), order: parseInt(form.order) || 0, is_active: form.is_active };
      if (isEdit) await youtubeVideosApi.update(String(id), payload as any);
      else await youtubeVideosApi.create(payload as any);
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
          <View style={[styles.hint, { backgroundColor: "#2E90FA15", borderRadius: radius.md }]}>
            <AppText style={styles.hintText}>💡 YouTube video ka pura link paste karo (watch / youtu.be / shorts) — Title aur Duration automatically fetch ho jayengi. Seedha 11-character Video ID bhi chalega.</AppText>
          </View>

          <AppText style={[styles.label, { color: colors.muted }]}>YouTube URL / Video ID *</AppText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={form.video_id}
              onChangeText={(v) => set("video_id", v)}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { flex: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            <Pressable
              onPress={handleFetchMeta}
              disabled={isFetching || !form.video_id.trim()}
              style={[styles.fetchBtn, { borderRadius: 10, opacity: isFetching || !form.video_id.trim() ? 0.6 : 1 }]}
            >
              <AppText style={styles.fetchBtnText}>{isFetching ? "..." : "⬇ Fetch"}</AppText>
            </Pressable>
          </View>
          {[["Title *", "title", "e.g. Real Numbers Introduction"], ["Duration", "duration", "e.g. 14:22"], ["Order", "order", "0"]].map(([label, key, placeholder]) => {
            return (
            <View key={key}>
              <AppText style={[styles.label, { color: colors.muted }]}>{label}</AppText>
              <TextInput value={(form as any)[key]} onChangeText={(v) => set(key, v)} placeholder={placeholder}
                placeholderTextColor={colors.muted} keyboardType={key === "order" ? "numeric" : "default"}
                autoCapitalize="none"
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />
            </View>
            );
          })}
          <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
            <View style={styles.toggleRow}>
              <AppText style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>✅ Active</AppText>
              <Switch value={form.is_active} onValueChange={(v) => set("is_active", v)} trackColor={{ true: brand.primary, false: colors.border }} thumbColor="#fff" />
            </View>
          </View>
          <Pressable onPress={save} disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: isSaving ? 0.7 : 1 }]}>
            <AppText style={styles.saveBtnText}>{isSaving ? "Saving..." : isEdit ? "💾 Update" : "✅ Add Video"}</AppText>
          </Pressable>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 }, scroll: { padding: 16 },
  hint: { padding: 10, marginBottom: 4 }, hintText: { fontSize: 12, color: "#2E90FA" },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  toggleCard: { borderWidth: 1, marginTop: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  saveBtn: { marginTop: 24, paddingVertical: 15, alignItems: "center" }, saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  fetchBtn: { paddingHorizontal: 14, justifyContent: "center", backgroundColor: "#2E90FA" },
  fetchBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
