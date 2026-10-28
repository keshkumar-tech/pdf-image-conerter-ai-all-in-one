import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { authApi } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "OtpVerification">;

export default function OtpVerificationScreen({ route, navigation }: Props) {
  const { email, purpose } = route.params;
  const { colors } = useTheme();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const handleVerify = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      if (purpose === "reset_password") {
        navigation.navigate("ResetPassword", { email });
        return;
      }
      const { user, access, refresh } = await authApi.verifyOtp(email, otp, purpose);
      await setTokens(access, refresh);
      setUser(user);
    } catch {
      setError("Invalid or expired OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1">Verify your email</AppText>
      <AppText variant="muted" style={{ marginTop: 4, marginBottom: 24 }}>
        Enter the 6-digit code we sent to {email}.
      </AppText>
      <TextInput
        style={[styles.otpInput, { borderColor: colors.border, color: colors.text }]}
        keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp}
        placeholder="000000" placeholderTextColor={colors.muted}
      />
      {error && <AppText style={{ color: "#F04438", marginTop: 12 }}>{error}</AppText>}
      <View style={{ marginTop: 20 }}>
        <Button label="Verify" fullWidth loading={isSubmitting} onPress={handleVerify} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  otpInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 16, fontSize: 22, letterSpacing: 8, textAlign: "center" },
});
