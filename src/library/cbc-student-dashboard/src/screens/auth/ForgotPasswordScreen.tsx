import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { authApi } from "@/services/auth";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      navigation.navigate("OtpVerification", { email, purpose: "reset_password" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1">Forgot password</AppText>
      <AppText variant="muted" style={{ marginTop: 4, marginBottom: 24 }}>We'll send an OTP to reset it.</AppText>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
        placeholder="you@example.com" placeholderTextColor={colors.muted}
      />
      <View style={{ marginTop: 20 }}>
        <Button label="Send OTP" fullWidth loading={isSubmitting} onPress={handleSubmit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
