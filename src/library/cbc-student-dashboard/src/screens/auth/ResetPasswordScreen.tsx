import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { authApi } from "@/services/auth";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const { colors } = useTheme();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      navigation.navigate("Login");
    } catch {
      setError("Couldn't reset password. Check the OTP and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1">Set a new password</AppText>
      <AppText variant="muted" style={{ marginTop: 4, marginBottom: 24 }}>For {email}</AppText>

      <AppText variant="caption" style={{ marginBottom: 6 }}>OTP</AppText>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} placeholderTextColor={colors.muted}
      />

      <AppText variant="caption" style={{ marginTop: 16, marginBottom: 6 }}>New Password</AppText>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholderTextColor={colors.muted}
      />

      {error && <AppText style={{ color: "#F04438", marginTop: 12 }}>{error}</AppText>}

      <View style={{ marginTop: 20 }}>
        <Button label="Reset Password" fullWidth loading={isSubmitting} onPress={handleReset} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
