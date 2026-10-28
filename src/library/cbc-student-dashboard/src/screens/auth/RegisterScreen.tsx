import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { authApi } from "@/services/auth";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.register(email, username, password, phone);
      navigation.navigate("OtpVerification", { email, purpose: "register" });
    } catch {
      setError("Couldn't create your account. Check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1">Create your account</AppText>
      <AppText variant="muted" style={{ marginTop: 4, marginBottom: 24 }}>Start learning for free today.</AppText>

      {[
        { label: "Full name", value: username, setter: setUsername, keyboardType: "default" as const },
        { label: "Email", value: email, setter: setEmail, keyboardType: "email-address" as const },
        { label: "Phone", value: phone, setter: setPhone, keyboardType: "phone-pad" as const },
      ].map((field) => (
        <View key={field.label} style={{ marginBottom: 16 }}>
          <AppText variant="caption" style={{ marginBottom: 6 }}>{field.label}</AppText>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoCapitalize="none" keyboardType={field.keyboardType} value={field.value} onChangeText={field.setter}
            placeholderTextColor={colors.muted}
          />
        </View>
      ))}

      <AppText variant="caption" style={{ marginBottom: 6 }}>Password</AppText>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor={colors.muted}
      />

      {error && <AppText style={{ color: "#F04438", marginTop: 12 }}>{error}</AppText>}

      <View style={{ marginTop: 20 }}>
        <Button label="Create Account" fullWidth loading={isSubmitting} onPress={handleRegister} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20, gap: 4 }}>
        <AppText variant="muted">Already have an account?</AppText>
        <AppText style={{ fontWeight: "700" }} onPress={() => navigation.navigate("Login")}>Sign in</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
