import { useCallback, useState } from "react";
import {
  Alert, FlatList, KeyboardAvoidingView, Platform, Pressable,
  RefreshControl, ScrollView, StyleSheet, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AppText } from "@/components/AppText";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";

interface Campaign {
  id: string;
  title: string;
  body: string;
  channel: string;
  audience: string;
  status: string;
  sent_at: string | null;
  recipients_count: number;
  created_at: string;
}
interface PagedRes { count: number; results: Campaign[]; }

const AUDIENCE_OPTIONS = [
  { key: "all",               label: "All Students" },
  { key: "free_students",     label: "Free Students" },
  { key: "premium_students",  label: "Premium Students" },
  { key: "inactive_students", label: "Inactive Students" },
];

const CHANNEL_OPTIONS = [
  { key: "push",  label: "📱 Push" },
  { key: "email", label: "📧 Email" },
  { key: "sms",   label: "💬 SMS" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft:     { bg: "#F7900920", text: "#F79009" },
  sent:      { bg: "#12B76A20", text: "#12B76A" },
  scheduled: { bg: "#2E90FA20", text: "#2E90FA" },
  cancelled: { bg: "#EF444420", text: "#EF4444" },
};

export default function AdminNotificationsScreen() {
  const { colors, brand, radius } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"send" | "history">("send");

  // Send form
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [channel, setChannel] = useState("push");
  const [audience, setAudience] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    try {
      const res = await apiClient.get<PagedRes>("/notifications/campaigns/", {
        params: { ordering: "-created_at" },
      });
      setCampaigns(res.data.results);
    } catch { /* silent */ }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const sendNow = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Validation", "Title aur message dono required hain.");
      return;
    }
    setIsSending(true);
    try {
      // 1. Create campaign
      const createRes = await apiClient.post("/notifications/campaigns/", {
        title: title.trim(),
        body: body.trim(),
        channel,
        audience,
      });
      const campaignId = createRes.data.id;

      // 2. Send immediately
      await apiClient.post(`/notifications/campaigns/${campaignId}/send_now/`);

      Alert.alert("✅ Sent!", `Notification "${title}" successfully bhej di gayi.`);
      setTitle(""); setBody(""); setChannel("push"); setAudience("all");
      load();
      setTab("history");
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data).slice(0, 250)
        : "Notification send nahi ho saki.";
      Alert.alert("Error", msg);
    } finally { setIsSending(false); }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>🔔 Notifications</AppText>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["send", "history"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { borderBottomColor: brand.primary, borderBottomWidth: 2.5 }]}>
            <AppText style={[styles.tabText, { color: tab === t ? brand.primary : colors.muted }]}>
              {t === "send" ? "📤 Send New" : `📋 History (${campaigns.length})`}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* ── SEND TAB ── */}
      {tab === "send" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {/* Channel */}
            <AppText style={[styles.label, { color: colors.muted }]}>Channel</AppText>
            <View style={styles.chipRow}>
              {CHANNEL_OPTIONS.map((c) => (
                <Pressable key={c.key} onPress={() => setChannel(c.key)}
                  style={[styles.chip, { borderColor: colors.border, borderRadius: radius.md },
                    channel === c.key && { backgroundColor: brand.primary, borderColor: brand.primary }]}>
                  <AppText style={{ color: channel === c.key ? "#fff" : colors.muted, fontSize: 12, fontWeight: "700" }}>
                    {c.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            {/* Audience */}
            <AppText style={[styles.label, { color: colors.muted }]}>Audience</AppText>
            <View style={styles.chipRow}>
              {AUDIENCE_OPTIONS.map((a) => (
                <Pressable key={a.key} onPress={() => setAudience(a.key)}
                  style={[styles.chip, { borderColor: colors.border, borderRadius: radius.md },
                    audience === a.key && { backgroundColor: "#12B76A", borderColor: "#12B76A" }]}>
                  <AppText style={{ color: audience === a.key ? "#fff" : colors.muted, fontSize: 11, fontWeight: "600" }}>
                    {a.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            {/* Title */}
            <AppText style={[styles.label, { color: colors.muted }]}>Title *</AppText>
            <TextInput value={title} onChangeText={setTitle}
              placeholder="e.g. New Course Available! 🎉"
              placeholderTextColor={colors.muted}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />

            {/* Message */}
            <AppText style={[styles.label, { color: colors.muted }]}>Message *</AppText>
            <TextInput value={body} onChangeText={setBody}
              placeholder="Notification ka message likho..."
              placeholderTextColor={colors.muted} multiline numberOfLines={4}
              style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]} />

            {/* Info */}
            <View style={[styles.infoBox, { backgroundColor: brand.primary + "10", borderRadius: radius.md }]}>
              <AppText style={[styles.infoText, { color: brand.primary }]}>
                💡 Campaign create karke turant send hogi. Firebase push ke liye Integration Settings mein configure karo.
              </AppText>
            </View>

            {/* Send button */}
            <Pressable onPress={sendNow} disabled={isSending}
              style={[styles.sendBtn, { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: isSending ? 0.7 : 1 }]}>
              <AppText style={styles.sendBtnText}>
                {isSending ? "Sending..." : "📤 Send Notification"}
              </AppText>
            </Pressable>
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>

      ) : isLoading ? (
        <LoadingState label="Loading history..." />

      ) : (
        /* ── HISTORY TAB ── */
        <FlatList
          data={campaigns}
          keyExtractor={(c) => c.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={brand.primary} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] ?? STATUS_COLORS.draft;
            return (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <AppText style={[styles.statusText, { color: sc.text }]}>{item.status}</AppText>
                  </View>
                  <View style={[styles.channelBadge, { backgroundColor: colors.background }]}>
                    <AppText style={[styles.channelText, { color: colors.muted }]}>{item.channel}</AppText>
                  </View>
                  <AppText style={[styles.dateText, { color: colors.muted }]}>
                    {formatDate(item.created_at)}
                  </AppText>
                </View>
                <AppText style={[styles.notifTitle, { color: colors.text }]}>{item.title}</AppText>
                <AppText style={[styles.notifBody, { color: colors.muted }]} numberOfLines={2}>{item.body}</AppText>
                <View style={styles.cardMeta}>
                  <AppText style={[styles.metaText, { color: colors.muted }]}>
                    👥 {item.audience} · 📨 {item.recipients_count} recipients
                  </AppText>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText style={{ fontSize: 32 }}>🔔</AppText>
              <AppText style={[styles.emptyText, { color: colors.text }]}>No campaigns yet</AppText>
              <AppText style={[styles.emptySub, { color: colors.muted }]}>
                Send tab se pehli notification bhejo
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "700" },
  scroll: { padding: 16 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  textarea: { textAlignVertical: "top", height: 100 },
  infoBox: { padding: 12, marginTop: 16 },
  infoText: { fontSize: 12, lineHeight: 18 },
  sendBtn: { marginTop: 20, paddingVertical: 15, alignItems: "center" },
  sendBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  list: { padding: 12, gap: 10, paddingBottom: 32 },
  card: { borderWidth: 1, padding: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  channelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  channelText: { fontSize: 11, fontWeight: "600" },
  dateText: { fontSize: 11, marginLeft: "auto" },
  notifTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  notifBody: { fontSize: 13, lineHeight: 18 },
  cardMeta: { marginTop: 6 },
  metaText: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center" },
});
