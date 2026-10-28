import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/StatusStates";

interface Bookmark { id: string; title: string; type: string; savedAt: string; }

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("cwk_bookmarks").then((raw) => raw && setBookmarks(JSON.parse(raw)));
  }, []);

  return (
    <Screen>
      <AppText variant="h1" style={{ marginBottom: 16 }}>Bookmarks</AppText>
      {bookmarks.length === 0 ? (
        <EmptyState title="No bookmarks yet" description="Bookmark lessons, community posts, or video timestamps to find them here." />
      ) : (
        bookmarks.map((b) => (
          <Card key={b.id} style={{ marginBottom: 12 }}>
            <AppText variant="h3">{b.title}</AppText>
            <AppText variant="caption" style={{ marginTop: 4 }}>{b.type} · saved {new Date(b.savedAt).toLocaleDateString()}</AppText>
          </Card>
        ))
      )}
    </Screen>
  );
}
