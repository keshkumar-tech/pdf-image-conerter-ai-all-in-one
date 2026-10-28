import React, { useLayoutEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/ThemeProvider";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "YouTubePlayer">;

export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = clean.match(regex);
  if (match?.[1]) {
    return match[1];
  }
  const fallback = clean.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return fallback?.[1] ?? null;
}

export default function YouTubePlayerScreen({ route, navigation }: Props) {
  const { videoId, title } = route.params;
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const cleanId = extractYouTubeId(videoId) || videoId;
  const youtubeUrl = `https://www.youtube.com/watch?v=${cleanId}`;

  const openInYouTube = () => {
    Linking.openURL(youtubeUrl).catch(() => undefined);
  };

  const embedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
          .video-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=1&enablejsapi=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#000" }]} edges={["top", "left", "right"]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <AppText style={styles.backIcon}>←</AppText>
        </Pressable>
        <AppText style={styles.topTitle} numberOfLines={1}>
          {title || "Lecture Video"}
        </AppText>
        <View style={styles.inAppChip}>
          <AppText style={styles.inAppChipText}>In-App</AppText>
        </View>
      </View>

      {/* Embedded In-App Player (Plays immediately inside the App!) */}
      <View style={styles.playerWrap}>
        <WebView
          source={{ html: embedHtml }}
          style={styles.webView}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          mixedContentMode="always"
          renderLoading={() => (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#FF0000" />
            </View>
          )}
        />
      </View>

      {/* Content & Action Area */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={[styles.videoTitle, { color: colors.text }]}>
          {title}
        </AppText>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: "#FF000018", borderColor: "#FF000030" }]}>
            <AppText style={{ color: "#FF0000", fontSize: 11, fontWeight: "700" }}>
              YouTube Lecture
            </AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: brand.primary + "18", borderColor: brand.primary + "30" }]}>
            <AppText style={{ color: brand.primary, fontSize: 11, fontWeight: "700" }}>
              Concept Builder Classes
            </AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.border + "60", borderColor: colors.border }]}>
            <AppText style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>
              Free Access
            </AppText>
          </View>
        </View>

        {/* Video Note Card */}
        <Card style={styles.noteCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <AppText style={{ fontSize: 16 }}>📱</AppText>
            <AppText style={[styles.noteTitle, { color: colors.text }]}>
              Playing in App
            </AppText>
          </View>
          <AppText style={[styles.noteText, { color: colors.muted }]}>
            This video is playing directly inside the Concept Builder Classes app with full speed, resolution, and fullscreen controls.
          </AppText>
        </Card>

        {/* Optional Re-Watch on YouTube Button */}
        <View style={styles.actionSection}>
          <AppText style={[styles.sectionPrompt, { color: colors.muted }]}>
            Want to open this video in the official YouTube application?
          </AppText>
          <Pressable
            onPress={openInYouTube}
            style={({ pressed }) => [
              styles.ytButton,
              {
                backgroundColor: "#FF0000",
                borderRadius: radius.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <AppText style={styles.ytButtonText}>
              ▶  Watch on YouTube App ↗
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#000",
    gap: 10,
  },
  backBtn: { padding: 4 },
  backIcon: { color: "#fff", fontSize: 22 },
  topTitle: { flex: 1, color: "#fff", fontSize: 15, fontWeight: "700" },
  inAppChip: {
    backgroundColor: "#12B76A20",
    borderColor: "#12B76A",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inAppChipText: { color: "#12B76A", fontSize: 11, fontWeight: "700" },
  playerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000",
  },
  loaderWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 25,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteCard: {
    padding: 14,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionSection: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E020",
  },
  sectionPrompt: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  ytButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ytButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
