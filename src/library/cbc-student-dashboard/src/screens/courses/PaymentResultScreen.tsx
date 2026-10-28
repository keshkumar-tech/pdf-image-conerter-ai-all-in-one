import { View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentResult">;

export default function PaymentResultScreen({ route, navigation }: Props) {
  const { success, courseId } = route.params;

  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 60 }}>
        <AppText style={{ fontSize: 56 }}>{success ? "🎉" : "😕"}</AppText>
        <AppText variant="h1" style={{ marginTop: 16, textAlign: "center" }}>
          {success ? "Purchase Successful!" : "Payment Failed"}
        </AppText>
        <AppText variant="muted" style={{ marginTop: 8, textAlign: "center" }}>
          {success
            ? "Course added to My Learning. Ab aap padhai shuru kar sakte ho."
            : "Payment process nahi ho paya. Koi amount charge nahi hua."}
        </AppText>
        <View style={{ marginTop: 32, width: "100%", gap: 10 }}>
          {success ? (
            <>
              <Button
                label="Go to My Learning"
                fullWidth
                onPress={() => navigation.navigate("MainTabs", { screen: "MyCoursesTab" })}
              />
              {courseId && (
                <Button
                  label="Start Learning"
                  variant="secondary"
                  fullWidth
                  onPress={() => navigation.navigate("Curriculum", { courseId })}
                />
              )}
            </>
          ) : (
            <Button label="Try Again" fullWidth onPress={() => navigation.goBack()} />
          )}
        </View>
      </View>
    </Screen>
  );
}
