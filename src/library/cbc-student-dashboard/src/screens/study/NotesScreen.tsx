import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Notes">;

interface Note { id: string; lessonId: string; text: string; createdAt: string; }

/** Notes are personal + lightweight, so they're stored locally (AsyncStorage)
 * rather than round-tripped through the API on every keystroke. */
export default function NotesScreen({ route }: Props) {
  const lessonId = route.params?.lessonId ?? "general";
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const storageKey = `cwk_notes_${lessonId}`;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((raw) => raw && setNotes(JSON.parse(raw)));
  }, [storageKey]);

  const addNote = async () => {
    if (!draft.trim()) return;
    const next = [{ id: String(Date.now()), lessonId, text: draft, createdAt: new Date().toISOString() }, ...notes];
    setNotes(next);
    setDraft("");
    await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Notes</AppText>
      <TextInput
        multiline style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, minHeight: 80, color: colors.text }}
        placeholder="Write a note for this lesson..." placeholderTextColor={colors.muted}
        value={draft} onChangeText={setDraft}
      />
      <View style={{ marginTop: 8, alignItems: "flex-end" }}>
        <Button label="Add Note" onPress={addNote} />
      </View>
      <View style={{ marginTop: 20 }}>
        {notes.length === 0 ? (
          <EmptyState title="No notes yet" description="Notes you take while learning will show up here." />
        ) : (
          notes.map((n) => (
            <View key={n.id} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 }}>
              <AppText>{n.text}</AppText>
              <AppText variant="caption" style={{ marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</AppText>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
