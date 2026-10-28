import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";

export default function AboutScreen() {
  const { brand } = useTheme();
  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: brand.primary, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>K</AppText>
        </View>
        <AppText variant="h2" style={{ marginTop: 16 }}>Concept Builder Classes</AppText>
        <AppText variant="muted" style={{ marginTop: 4 }}>Version 1.0.0</AppText>
      </View>
      <AppText style={{ marginTop: 24, textAlign: "center" }}>
        Learn Web Development, App Development, Python, Django and more —
        taught the way real production apps are built.
      </AppText>
    </Screen>
  );
}
