import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusStates";
import { useResourceList } from "@/hooks/useResource";
import { certificatesApi } from "@/services/resources";
import type { Certificate } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Certificates">;

export default function CertificatesScreen({ navigation }: Props) {
  const { data, isLoading, error, refetch } = useResourceList<Certificate>(certificatesApi);

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Certificates</AppText>
      {isLoading ? <LoadingState label="Loading certificates..." /> :
       error ? <ErrorState message={error} onRetry={refetch} /> :
       data.length === 0 ? <EmptyState title="No certificates yet" description="Complete a course to earn your first certificate." /> :
        data.map((cert) => (
          <Pressable key={cert.id} onPress={() => navigation.navigate("CertificateDetail", { certificateId: cert.id })}>
            <Card style={{ marginBottom: 12 }}>
              <AppText variant="h3">{cert.course_title}</AppText>
              <AppText variant="caption" style={{ marginTop: 4 }}>{cert.certificate_number}</AppText>
            </Card>
          </Pressable>
        ))
      }
    </Screen>
  );
}
