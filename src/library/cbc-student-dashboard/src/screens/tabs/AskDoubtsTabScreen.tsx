import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// ─── Quick suggestion chips ───────────────────────────────────────────────────

const QUICK_CHIPS = [
  "Explain Newton's 3rd Law",
  "What is photosynthesis?",
  "Solve: x² + 5x + 6 = 0",
  "Difference between mitosis and meiosis",
  "What is Ohm's Law?",
  "Explain the water cycle",
];

// ─── OpenAI call ─────────────────────────────────────────────────────────────

// Expo replaces EXPO_PUBLIC_ variables at build time via Babel
// Using string access to avoid tree-shaking issues
const OPENAI_API_KEY: string = (process.env as any)["EXPO_PUBLIC_OPENAI_API_KEY"] || "";

async function askChatGPT(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  const key = OPENAI_API_KEY.trim();

  if (!key || key === "your-openai-api-key-here") {
    await new Promise((r) => setTimeout(r, 1200));
    return "⚠️ OpenAI API key is not configured yet. Please add your EXPO_PUBLIC_OPENAI_API_KEY to the .env file to enable AI responses.\n\nFor now, this is a demo response. Once the key is added, real ChatGPT answers will appear here!";
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response received.";
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a helpful academic tutor for Indian students studying in Class 9–12 (UP Board). 
You answer questions in a clear, friendly, and easy-to-understand way. 
When solving problems, show step-by-step solutions.
Use Hindi mixed with English (Hinglish) only when the student asks in Hindi — otherwise answer in English.
Keep answers concise but complete. Use bullet points or numbered steps for clarity.`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AskDoubtsTabScreen() {
  const { colors, brand, resolved } = useTheme();
  const isDark = resolved === "dark";
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Namaste ${user?.username ?? "Student"}! 👋\n\nI'm your AI Doubt Solver powered by ChatGPT. Ask me anything — Maths, Science, English, or any subject!\n\nYou can type your question or tap a suggestion below.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = [...messages.slice(-9), userMsg].map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

    try {
      const reply = await askChatGPT([
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ]);
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: "assistant", text: reply, timestamp: new Date() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: `e_${Date.now()}`, role: "assistant", text: `❌ Error: ${err?.message ?? "Something went wrong."}`, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { id: `welcome_${Date.now()}`, role: "assistant", text: "Chat cleared! Ask me anything 😊", timestamp: new Date() },
    ]);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    // Outer View: full flex, uses theme background
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Header (respects top inset) ── */}
      <View style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 8,
        }
      ]}>
        <View style={styles.headerLeft}>
          <View style={[styles.botAvatar, { backgroundColor: brand.primary }]}>
            <AppText style={styles.botAvatarText}>AI</AppText>
          </View>
          <View>
            <AppText style={[styles.headerTitle, { color: colors.text }]}>AI Doubt Solver</AppText>
            <AppText style={[styles.headerSub, { color: "#12B76A" }]}>
              {isLoading ? "Typing..." : "● Online"}
            </AppText>
          </View>
        </View>
        <Pressable onPress={clearChat} hitSlop={8} style={[styles.clearBtn, { borderColor: colors.border }]}>
          <AppText style={[styles.clearText, { color: colors.muted }]}>Clear</AppText>
        </Pressable>
      </View>

      {/* ── Messages list (flex: 1 shrinks when keyboard pushes input up) ── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isUser = item.role === "user";
          return (
            <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
              {!isUser && (
                <View style={[styles.msgAvatar, { backgroundColor: brand.primary }]}>
                  <AppText style={styles.msgAvatarText}>AI</AppText>
                </View>
              )}
              <View style={[
                styles.bubble,
                isUser
                  ? [styles.bubbleUser, { backgroundColor: brand.primary }]
                  : [styles.bubbleBot, {
                      backgroundColor: isDark ? "#1a2236" : colors.surface,
                      borderColor: colors.border,
                    }],
              ]}>
                <AppText style={[styles.bubbleText, { color: isUser ? "#fff" : colors.text }]}>
                  {item.text}
                </AppText>
                <AppText style={[styles.timeText, { color: isUser ? "rgba(255,255,255,0.6)" : colors.muted }]}>
                  {formatTime(item.timestamp)}
                </AppText>
              </View>
              {isUser && (
                <View style={[styles.msgAvatar, { backgroundColor: brand.secondary }]}>
                  <AppText style={styles.msgAvatarText}>
                    {user?.username?.[0]?.toUpperCase() ?? "S"}
                  </AppText>
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          isLoading ? (
            <View style={[styles.msgRow, { paddingHorizontal: 0 }]}>
              <View style={[styles.msgAvatar, { backgroundColor: brand.primary }]}>
                <AppText style={styles.msgAvatarText}>AI</AppText>
              </View>
              <View style={[styles.typingBubble, {
                backgroundColor: isDark ? "#1a2236" : colors.surface,
                borderColor: colors.border,
              }]}>
                <ActivityIndicator size="small" color={brand.primary} />
                <AppText style={[styles.typingText, { color: colors.muted }]}>Thinking...</AppText>
              </View>
            </View>
          ) : null
        }
      />

      {/* ── Quick chips (only shown on fresh chat) ── */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_CHIPS.map((item) => (
            <Pressable
              key={item}
              onPress={() => sendMessage(item)}
              style={[styles.chip, {
                backgroundColor: isDark ? "#1a2236" : "#EEF2FF",
                borderColor: brand.primary + "44",
              }]}
            >
              <AppText style={[styles.chipText, { color: brand.primary }]}>{item}</AppText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ── Input bar
            Uses paddingBottom from insets so it stays above the tab bar
            on Android the OS handles keyboard pushing — no KeyboardAvoidingView needed
            when android:windowSoftInputMode="adjustResize" is set. ── */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
        }
      ]}>
        <TextInput
          style={[styles.input, {
            backgroundColor: isDark ? "#1a2236" : colors.background,
            borderColor: colors.border,
            color: colors.text,
          }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type your doubt here..."
          placeholderTextColor={colors.muted}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <Pressable
          onPress={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: input.trim() && !isLoading ? brand.primary : colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <AppText style={styles.sendIcon}>{isLoading ? "⏳" : "➤"}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  botAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  botAvatarText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSub: { fontSize: 11, marginTop: 1 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 20 },
  clearText: { fontSize: 12, fontWeight: "600" },

  msgList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  msgAvatarText: { color: "#fff", fontWeight: "800", fontSize: 10 },
  bubble: { maxWidth: "78%", padding: 12, borderRadius: 16 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleBot: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  timeText: { fontSize: 10, marginTop: 4, textAlign: "right" },

  typingBubble: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 16, borderWidth: 1, borderBottomLeftRadius: 4 },
  typingText: { fontSize: 13 },

  chips: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "600" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  sendIcon: { fontSize: 18, color: "#fff" },
});
