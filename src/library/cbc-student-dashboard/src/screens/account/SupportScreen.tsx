import { useState } from "react";
import { TextInput, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { apiClient } from "@/services/apiClient";

export default function SupportScreen() {
  const { colors } = useTheme();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/support/tickets/", { subject, message });
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Screen>
        <AppText variant="h1">Ticket submitted</AppText>
        <AppText variant="muted" style={{ marginTop: 8 }}>Our team will get back to you soon.</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Support</AppText>
      <AppText variant="caption" style={{ marginBottom: 6 }}>Subject</AppText>
      <TextInput
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, marginBottom: 16 }}
        value={subject} onChangeText={setSubject} placeholderTextColor={colors.muted}
      />
      <AppText variant="caption" style={{ marginBottom: 6 }}>Message</AppText>
      <TextInput
        multiline style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, minHeight: 120, color: colors.text }}
        value={message} onChangeText={setMessage} placeholderTextColor={colors.muted}
      />
      <View style={{ marginTop: 20 }}>
        <Button label="Submit Ticket" fullWidth loading={isSubmitting} onPress={submit} />
      </View>
    </Screen>
  );
}
