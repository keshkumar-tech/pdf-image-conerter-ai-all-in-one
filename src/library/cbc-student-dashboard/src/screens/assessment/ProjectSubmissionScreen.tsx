import { useState } from "react";
import { TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { projectSubmissionsApi } from "@/services/resources";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProjectSubmission">;

export default function ProjectSubmissionScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const { colors } = useTheme();
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await projectSubmissionsApi.create({ project: projectId, github_url: githubUrl, demo_url: demoUrl, zip_url: zipUrl } as any);
      navigation.popToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Submit Your Project</AppText>

      {[
        { label: "GitHub URL", value: githubUrl, setter: setGithubUrl },
        { label: "Live Demo URL", value: demoUrl, setter: setDemoUrl },
        { label: "ZIP Upload URL", value: zipUrl, setter: setZipUrl },
      ].map((field) => (
        <View key={field.label} style={{ marginBottom: 16 }}>
          <AppText variant="caption" style={{ marginBottom: 6 }}>{field.label}</AppText>
          <TextInput
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text }}
            value={field.value} onChangeText={field.setter} placeholderTextColor={colors.muted} placeholder="https://..."
          />
        </View>
      ))}

      <Button label="Submit for Review" fullWidth loading={isSubmitting} onPress={submit} />
    </Screen>
  );
}
