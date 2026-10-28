import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { videosApi, progressApi } from "@/services/resources";
import type { VideoPlayback } from "@/services/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "VideoPlayer">;

export default function VideoPlayerScreen({ route, navigation }: Props) {
  const params = route.params as any;
  const directYouTube = params?.video as string | undefined;
  const moduleTitle = params?.moduleTitle as string | undefined;
  const legacyVideoId = params?.videoId as string | undefined;
  const legacyLessonId = params?.lessonId as string | undefined;

  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  const [playback, setPlayback] = useState<VideoPlayback | null>(null);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);
  const fileWebRef = useRef<WebView>(null);

  const effectiveVideoId = legacyVideoId || (directYouTube ? "direct" : undefined);
  const effectiveLessonId = legacyLessonId || directYouTube || "";

  const load = () => {
    if (directYouTube) {
      setIsLoading(false);
      setError(null);
      setPlayback({
        signed_url: "",
        youtube_url: directYouTube,
        provider: "youtube",
        expires_at: null,
        resume_position_seconds: 0,
      });
      return;
    }
    if (!legacyVideoId) {
      setIsLoading(false);
      setError("Video unavailable.");
      return;
    }
    setIsLoading(true);
    setError(null);
    videosApi.playback(legacyVideoId)
      .then(setPlayback)
      .catch(() => setError("Video unavailable. Please check your entitlement or try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [effectiveVideoId]);

  const markComplete = async () => {
    setMarkingDone(true);
    try {
      await progressApi.create({ lesson: effectiveLessonId, is_completed: true } as any);
      navigation.goBack();
    } finally {
      setMarkingDone(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <LoadingState label="Loading video..." />
    </SafeAreaView>
  );

  if (error || !playback) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ErrorState message={error ?? "Playback unavailable."} onRetry={load} />
    </SafeAreaView>
  );

  const isYouTube = playback.provider === "youtube" || !!playback.youtube_url;
  const youtubeUrl = playback.youtube_url ?? "";
  // Self-hosted uploaded file (provider 'self' or any CDN signed URL) plays in an HTML5 <video>
  const selfHostedUrl = !isYouTube && playback.signed_url ? playback.signed_url : "";

  // Robust YouTube video ID extraction from URL or raw ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const clean = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const m = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (m?.[1]) return m[1];
    const fallback = clean.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return fallback?.[1] ?? null;
  };
  const ytId = isYouTube ? getYouTubeId(youtubeUrl || (playback as any).provider_asset_id || "") : null;

  const embedHtml = ytId ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; overflow: hidden; }
          .video-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
          iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <div class="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&fs=1&iv_load_policy=3"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </body>
    </html>
  ` : null;

  // HTML5 <video> player for self-uploaded mp4 files (served from our own backend/media)
  const fileHtml = selfHostedUrl ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; overflow: hidden; }
          .video-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
          video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; outline: none; }
        </style>
      </head>
      <body>
        <div class="video-wrap">
          <video
            id="player"
            src="${selfHostedUrl}${(playback.resume_position_seconds ?? 0) > 1 ? `#t=${Math.floor(playback.resume_position_seconds ?? 0)}` : ""}"
            controls autoplay playsinline preload="auto"></video>
        </div>
      </body>
    </html>
  ` : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#000" }]} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <AppText style={styles.backIcon}>←</AppText>
        </Pressable>
        <AppText style={styles.topTitle} numberOfLines={1}>{moduleTitle || "Video Lesson"}</AppText>
        {isYouTube && (
          <Pressable onPress={() => Linking.openURL(youtubeUrl)} style={styles.ytChip}>
            <AppText style={styles.ytChipText}>YouTube</AppText>
          </Pressable>
        )}
      </View>

      {/* Player area */}
      {isYouTube && ytId && embedHtml ? (
        <WebView
          source={{ html: embedHtml }}
          style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          mixedContentMode="always"
        />
      ) : isYouTube ? (
        <Pressable onPress={() => Linking.openURL(youtubeUrl)} style={styles.playerArea}>
          <View style={styles.playerInner}>
            <View style={styles.playCircle}>
              <AppText style={styles.playTriangle}>▶</AppText>
            </View>
            <AppText style={styles.playerLabel}>Tap to Watch on YouTube</AppText>
          </View>
        </Pressable>
      ) : fileHtml ? (
        <WebView
          ref={fileWebRef}
          source={{ html: fileHtml }}
          style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          mixedContentMode="always"
          setSupportMultipleWindows={false}
        />
      ) : (
        <View style={styles.playerArea}>
          <View style={styles.playerInner}>
            <AppText style={{ fontSize: 48 }}>🎥</AppText>
            <AppText style={styles.playerLabel}>
              Resume from {Math.floor((playback.resume_position_seconds ?? 0) / 60)}m{" "}
              {(playback.resume_position_seconds ?? 0) % 60}s
            </AppText>
          </View>
        </View>
      )}

      {/* Speed controls (for uploaded files & CDN videos) */}
      {!isYouTube && (
        <View style={[styles.speedBar, { backgroundColor: "#111827" }]}>
          {[0.75, 1, 1.25, 1.5, 2].map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                setSpeed(s);
                fileWebRef.current?.injectJavaScript(`(function(){var v=document.getElementById('player');if(v){v.playbackRate=${s};}})(), true;`);
              }}
              style={[
                styles.speedBtn,
                { backgroundColor: speed === s ? brand.primary : "#253047" },
              ]}
            >
              <AppText style={{ color: speed === s ? "#fff" : "#98A2B3", fontWeight: "700", fontSize: 12 }}>
                {s}×
              </AppText>
            </Pressable>
          ))}
        </View>
      )}

      {/* YouTube action buttons */}
      {isYouTube && (
        <View style={[styles.actionsRow, { backgroundColor: "#111827" }]}>
          <Pressable
            onPress={() => Linking.openURL(youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`)}
            style={[styles.actionBtn, { backgroundColor: "#FF0000" }]}
          >
            <AppText style={styles.actionText}>📺  Watch on YouTube App ↗</AppText>
          </Pressable>
        </View>
      )}

      {/* Info + mark complete */}
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16 }}>
          {isYouTube && (
            <View style={[styles.ytInfo, { backgroundColor: isDark ? "#1a2236" : "#FFF8F0", borderColor: "#F79009" }]}>
              <AppText style={{ color: "#F79009", fontSize: 12, lineHeight: 18 }}>
                📺 This video is hosted on YouTube. You can also watch in the YouTube app for HD, subtitles and fullscreen.
              </AppText>
            </View>
          )}

          <Pressable
            onPress={markComplete}
            disabled={markingDone}
            style={({ pressed }) => [
              styles.markDoneBtn,
              { backgroundColor: brand.primary, borderRadius: radius.lg, opacity: pressed || markingDone ? 0.8 : 1 },
            ]}
          >
            <AppText style={styles.markDoneText}>
              {markingDone ? "Saving..." : "✅  Mark as Complete"}
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
  topTitle: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "600" },
  ytChip: { backgroundColor: "#FF0000", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  ytChipText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  playerArea: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  playerInner: { alignItems: "center", gap: 10 },
  playCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FF0000",
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: { color: "#fff", fontSize: 28, marginLeft: 4 },
  playerLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },

  speedBar: {
    flexDirection: "row",
    padding: 10,
    gap: 8,
    justifyContent: "center",
  },
  speedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  actionsRow: { flexDirection: "row", padding: 10, gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  ytInfo: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  markDoneBtn: { paddingVertical: 16, alignItems: "center" },
  markDoneText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
