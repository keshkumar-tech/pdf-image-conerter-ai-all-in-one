import { useEffect, useState } from "react";
import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { certificatesApi } from "@/services/resources";
import type { Certificate } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CertificateDetail">;

export default function CertificateDetailScreen({ route }: Props) {
  const { certificateId } = route.params;
  const { brand } = useTheme();
  const [cert, setCert] = useState<Certificate | null>(null);

  useEffect(() => {
    certificatesApi.retrieve(certificateId).then(setCert);
  }, [certificateId]);

  if (!cert) return <Screen><LoadingState label="Loading certificate..." /></Screen>;

  return (
    <Screen>
      <Card style={{ borderColor: brand.primary, borderWidth: 2, alignItems: "center", paddingVertical: 32 }}>
        <AppText style={{ fontSize: 40 }}>🏆</AppText>
        <AppText variant="h2" style={{ marginTop: 12, textAlign: "center" }}>{cert.course_title}</AppText>
        <AppText variant="muted" style={{ marginTop: 4 }}>Certificate of Completion</AppText>
        <AppText variant="caption" style={{ marginTop: 16 }}>{cert.certificate_number}</AppText>
        <AppText variant="caption">{new Date(cert.issued_at).toLocaleDateString()}</AppText>
        <View style={{ width: 100, height: 100, backgroundColor: "#eee", marginTop: 16, alignItems: "center", justifyContent: "center" }}>
          <AppText variant="caption">QR Code</AppText>
        </View>
      </Card>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
        <Button label="Download" variant="secondary" />
        <Button label="Share" variant="secondary" />
      </View>
    </Screen>
  );
}
