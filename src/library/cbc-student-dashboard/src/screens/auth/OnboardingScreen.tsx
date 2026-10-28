import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/ThemeProvider";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

const slides = [
  { title: "Learn to build real apps", body: "Web, mobile, backend — taught the way Kesh builds in production." },
  { title: "Free and premium courses", body: "Start free. Unlock premium courses starting at just ₹499." },
  { title: "Track streaks & earn certificates", body: "Stay consistent, finish courses, and share verified certificates." },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { colors, brand } = useTheme();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <AppText variant="h1" style={{ textAlign: "center" }}>{slide.title}</AppText>
        <AppText variant="muted" style={{ textAlign: "center", marginTop: 12 }}>{slide.body}</AppText>
      </View>
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === index ? brand.primary : colors.border }]} />
        ))}
      </View>
      <View style={{ padding: 24 }}>
        <Button
          label={isLast ? "Get Started" : "Next"}
          fullWidth
          onPress={() => (isLast ? navigation.replace("Login") : setIndex((i) => i + 1))}
        />
        {!isLast && (
          <Button label="Skip" variant="secondary" fullWidth onPress={() => navigation.replace("Login")} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
