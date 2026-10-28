import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { communityPostsApi } from "@/services/resources";
import { apiClient } from "@/services/apiClient";
import type { CommunityPost } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

export default function PostDetailScreen({ route }: Props) {
  const { postId } = route.params;
  const { colors } = useTheme();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comment, setComment] = useState("");

  const load = () => communityPostsApi.retrieve(postId).then(setPost);
  useEffect(() => { load(); }, [postId]);

  const toggleLike = async () => {
    if (!post) return;
    await communityPostsApi.action(postId, post.is_liked ? "unlike" : "like");
    load();
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    await apiClient.post("/community/comments/", { post: postId, body: comment });
    setComment("");
    load();
  };

  if (!post) return <Screen><LoadingState label="Loading post..." /></Screen>;

  return (
    <Screen>
      <AppText variant="h2">{post.title || "Discussion"}</AppText>
      <AppText style={{ marginTop: 8 }}>{post.body}</AppText>
      <Pressable onPress={toggleLike} style={{ marginTop: 12 }}>
        <AppText>{post.is_liked ? "❤️" : "🤍"} {post.likes_count} likes</AppText>
      </Pressable>

      <AppText variant="h3" style={{ marginTop: 20, marginBottom: 12 }}>Comments</AppText>
      {post.comments?.map((c) => (
        <Card key={c.id} style={{ marginBottom: 10 }}>
          <AppText>{c.body}</AppText>
          <AppText variant="caption" style={{ marginTop: 4 }}>{new Date(c.created_at).toLocaleString()}</AppText>
        </Card>
      ))}

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.text }}
          value={comment} onChangeText={setComment} placeholder="Write a comment..." placeholderTextColor={colors.muted}
        />
        <Button label="Send" onPress={submitComment} />
      </View>
    </Screen>
  );
}
