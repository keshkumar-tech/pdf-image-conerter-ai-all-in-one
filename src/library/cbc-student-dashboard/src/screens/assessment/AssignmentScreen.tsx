import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { assignmentSubmissionsApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { Assignment } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Assignment">;

export default function AssignmentScreen({ route, navigation }: Props) {
  const { assignmentId } = route.params;
  const { colors } = useTheme();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [textSubmission, setTextSubmission] = useState("");
  const [linkSubmission, setLinkSubmission] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get(`/assignments/${assignmentId}/`).then((r) => setAssignment(r.data)).finally(() => setIsLoading(false));
  }, [assignmentId]);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await assignmentSubmissionsApi.create({ assignment: assignmentId, text_submission: textSubmission, link_submission: linkSubmission } as any);
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !assignment) return <Screen><LoadingState label="Loading assignment..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h1">{assignment.title}</AppText>
      {assignment.deadline_days && <Badge tone="warning">{`Due ${assignment.deadline_days} days after enrollment`}</Badge>}
      <Card style={{ marginTop: 16 }}>
        <AppText>{assignment.instructions}</AppText>
      </Card>

      <AppText variant="caption" style={{ marginTop: 16, marginBottom: 6 }}>Your answer</AppText>
      <TextInput
        multiline style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, minHeight: 100, color: colors.text }}
        value={textSubmission} onChangeText={setTextSubmission} placeholderTextColor={colors.muted}
      />

      <AppText variant="caption" style={{ marginTop: 16, marginBottom: 6 }}>Link (optional)</AppText>
      <TextInput
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text }}
        value={linkSubmission} onChangeText={setLinkSubmission} placeholderTextColor={colors.muted}
        placeholder="https://..."
      />

      <View style={{ marginTop: 20 }}>
        <Button label="Submit Assignment" fullWidth loading={isSubmitting} onPress={submit} />
      </View>
    </Screen>
  );
}
