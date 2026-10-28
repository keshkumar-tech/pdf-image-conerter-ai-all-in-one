import { useState } from "react";
import { FlatList, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { CourseCard } from "@/components/CourseCard";
import { Screen } from "@/components/Screen";
import { EmptyState, LoadingState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { coursesApi } from "@/services/resources";
import type { Course } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export default function SearchScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) { setResults([]); setHasSearched(false); return; }
    setIsSearching(true);
    setHasSearched(true);
    const res = await coursesApi.list({ search: text, is_published: true });
    setResults(res.results);
    setIsSearching(false);
  };

  return (
    <Screen scroll={false}>
      <TextInput
        autoFocus
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, marginBottom: 16 }}
        placeholder="Search courses, topics, instructors..." placeholderTextColor={colors.muted}
        value={query} onChangeText={runSearch}
      />
      {isSearching ? <LoadingState label="Searching..." /> :
       !hasSearched ? <EmptyState title="Search Concept Builder Classes" description="Find courses by name, topic or instructor." /> :
       results.length === 0 ? <EmptyState title="No results" description={`Nothing matched "${query}".`} /> :
        <FlatList
          data={results} keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => navigation.navigate("CourseDetails", { courseId: item.id })} />
          )}
        />
      }
    </Screen>
  );
}
