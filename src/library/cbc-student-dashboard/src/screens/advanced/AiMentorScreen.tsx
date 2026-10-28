import { useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";

interface ChatMessage { id: string; role: "user" | "mentor"; text: string; }

const quickActions = ["Explain this topic", "Debug my code", "Practice questions", "Create a learning plan"];

/** Chat calls a backend endpoint (never the AI provider directly) so the
 * API key configured in the admin AI Mentor screen never reaches the app. */
export default function AiMentorScreen() {
  const { colors, brand } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "0", role: "mentor", text: "Hi! I'm your AI Mentor. Ask me to explain a topic, debug code, or quiz you." },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsSending(true);
    try {
      const res = await apiClient.post("/ai/mentor/chat/", { message: text });
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: "mentor", text: res.data.reply }]);
    } catch {
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: "mentor", text: "AI Mentor isn't configured yet — an admin needs to set a provider in AI Mentor settings." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={messages} keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={{
            alignSelf: item.role === "user" ? "flex-end" : "flex-start",
            backgroundColor: item.role === "user" ? brand.primary : colors.surface,
            borderColor: colors.border, borderWidth: item.role === "user" ? 0 : 1,
            borderRadius: 14, padding: 12, marginBottom: 10, maxWidth: "85%",
          }}>
            <AppText style={{ color: item.role === "user" ? "#fff" : colors.text }}>{item.text}</AppText>
          </View>
        )}
      />
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
        data={quickActions} keyExtractor={(a) => a}
        renderItem={({ item }) => (
          <AppText onPress={() => send(item)} style={{ marginRight: 8, fontSize: 12, color: brand.primary }}>{item}</AppText>
        )}
      />
      <View style={{ flexDirection: "row", gap: 8, padding: 16 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.text }}
          value={input} onChangeText={setInput} placeholder="Ask your AI Mentor..." placeholderTextColor={colors.muted}
        />
        <Button label="Send" loading={isSending} onPress={() => send(input)} />
      </View>
    </Screen>
  );
}
