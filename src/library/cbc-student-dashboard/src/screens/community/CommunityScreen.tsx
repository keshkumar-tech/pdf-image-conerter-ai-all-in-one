import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusStates";
import { useResourceList } from "@/hooks/useResource";
import { communityPostsApi } from "@/services/resources";
import type { CommunityPost } from "@/services/types";
import type { MainTabParamList, RootStackParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "AskDoubtsTab">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CommunityScreen({ navigation }: Props) {
  const { data, isLoading, error, refetch } = useResourceList<CommunityPost>(communityPostsApi);

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <AppText variant="h1">Community</AppText>
        <Button label="+ Post" onPress={() => navigation.navigate("CreatePost")} />
      </View>
      {isLoading ? <LoadingState label="Loading discussions..." /> :
       error ? <ErrorState message={error} onRetry={refetch} /> :
       data.length === 0 ? <EmptyState title="No posts yet" description="Be the first to ask a question or share something." /> :
        data.map((post) => (
          <Pressable key={post.id} onPress={() => navigation.navigate("PostDetail", { postId: post.id })}>
            <Card style={{ marginBottom: 12 }}>
              {post.is_question && <Badge tone="primary">Question</Badge>}
              <AppText variant="h3" style={{ marginTop: 6 }}>{post.title || post.body.slice(0, 60)}</AppText>
              <AppText variant="caption" style={{ marginTop: 8 }}>
                ❤️ {post.likes_count} · 💬 {post.comments_count}
              </AppText>
            </Card>
          </Pressable>
        ))
      }
    </Screen>
  );
}
