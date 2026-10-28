import { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme/ThemeProvider";
import { STUDENT_CLASSES, useStudentClassStore, type StudentClass } from "@/store/studentClassStore";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "SelectCategory">;

export default function SelectCategoryScreen({ navigation }: Props) {
  const { colors, radius } = useTheme();
  const { selectedClass, setClass } = useStudentClassStore();
  const [picked, setPicked] = useState<StudentClass>(selectedClass);
  const [query, setQuery] = useState("");

  const filtered = STUDENT_CLASSES.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  const handleSave = async () => {
    await setClass(picked);
    navigation.goBack();
  };

  return (
    <Screen>
      <AppText variant="h1" style={{ textAlign: "center", marginBottom: 20 }}>Select Category</AppText>

      <TextInput
        style={[styles.search, { borderColor: colors.border, color: colors.text, borderRadius: radius.md }]}
        placeholder="Search here"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setPicked(item)}
            style={[
              styles.option,
              { borderColor: picked === item ? "#1B2B4B" : colors.border, borderRadius: radius.md },
              picked === item && { borderWidth: 2 },
            ]}
          >
            <View style={styles.logoCircle}>
              <AppText>🎓</AppText>
            </View>
            <AppText style={{ flex: 1, fontWeight: "700", fontSize: 15 }}>{item}</AppText>
            <AppText style={{ color: colors.muted }}>›</AppText>
          </Pressable>
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Button label="Save" fullWidth onPress={handleSave} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  option: { flexDirection: "row", alignItems: "center", borderWidth: 1, padding: 14, marginBottom: 12, gap: 12 },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F2F4F7", alignItems: "center", justifyContent: "center" },
});
