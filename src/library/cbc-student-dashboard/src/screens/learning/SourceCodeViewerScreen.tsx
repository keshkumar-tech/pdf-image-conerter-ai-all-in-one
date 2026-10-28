import { ScrollView, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "SourceCodeViewer">;

const sampleFiles = ["App.tsx", "components/Button.tsx", "services/api.ts"];

/** Real implementation fetches the file tree + contents for `resourceId`
 * and renders with a syntax highlighter (e.g. react-native-syntax-highlighter). */
export default function SourceCodeViewerScreen({ route }: Props) {
  const { title } = route.params;
  const { colors } = useTheme();

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={{ width: 140, borderRightWidth: 1, borderRightColor: colors.border, padding: 12 }}>
          <AppText variant="caption" style={{ marginBottom: 8 }}>FILES</AppText>
          {sampleFiles.map((f) => <AppText key={f} variant="caption" style={{ marginBottom: 8 }}>{f}</AppText>)}
        </View>
        <ScrollView style={{ flex: 1, backgroundColor: "#0B1220", padding: 12 }}>
          <AppText style={{ color: "#F9FAFB", fontFamily: "monospace", fontSize: 12 }}>
            {`// ${title}\n\nexport default function Example() {\n  return null;\n}`}
          </AppText>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 16 }}>
        <Button label="Copy" variant="secondary" />
        <Button label="Download" variant="secondary" />
      </View>
    </Screen>
  );
}
