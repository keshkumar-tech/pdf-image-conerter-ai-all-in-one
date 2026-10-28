import { useState } from "react";
import { TextInput, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { verifyCertificate, type CertificateVerifyResponse } from "@/services/certificateVerify";

/** Public screen — no auth required. Anyone with a certificate number
 * (e.g. an employer) can confirm it's genuine. */
export default function CertificateVerificationScreen() {
  const { colors } = useTheme();
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<CertificateVerifyResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = async () => {
    setIsChecking(true);
    try {
      const res = await verifyCertificate(number);
      setResult(res);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1">Verify a Certificate</AppText>
      <AppText variant="muted" style={{ marginTop: 4, marginBottom: 20 }}>
        Enter a certificate number to confirm it was genuinely issued by Concept Builder Classes.
      </AppText>
      <TextInput
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text }}
        autoCapitalize="characters" value={number} onChangeText={setNumber} placeholderTextColor={colors.muted}
        placeholder="CWK-2026-XXXXXX-XXXXXX"
      />
      <View style={{ marginTop: 16 }}>
        <Button label="Verify" loading={isChecking} onPress={check} />
      </View>

      {result && (
        <Card style={{ marginTop: 24 }}>
          <Badge tone={result.is_valid ? "success" : "danger"}>{result.is_valid ? "Valid Certificate" : "Not Found"}</Badge>
          {result.is_valid && (
            <View style={{ marginTop: 12 }}>
              <AppText variant="h3">{result.course_title}</AppText>
              <AppText variant="muted">Issued to {result.student_name}</AppText>
              <AppText variant="caption" style={{ marginTop: 4 }}>{result.issued_at && new Date(result.issued_at).toLocaleDateString()}</AppText>
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}
