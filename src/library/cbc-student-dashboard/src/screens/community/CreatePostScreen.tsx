import { useState } from "react";
import { TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { communityPostsApi } from "@/services/resources";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CreatePost">;

export default function CreatePostScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await communityPostsApi.create({ title, body, is_question: isQuestion } as any);
      navigation.goBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>New Post</AppText>
      <TextInput
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, marginBottom: 12 }}
        placeholder="Title" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle}
      />
      <TextInput
        multiline style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, minHeight: 120, color: colors.text }}
        placeholder="What's on your mind?" placeholderTextColor={colors.muted} value={body} onChangeText={setBody}
      />
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
        <AppText onPress={() => setIsQuestion((q) => !q)}>{isQuestion ? "☑" : "☐"} Mark as a question</AppText>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button label="Post" fullWidth loading={isSubmitting} onPress={submit} />
      </View>
    </Screen>
  );
}
