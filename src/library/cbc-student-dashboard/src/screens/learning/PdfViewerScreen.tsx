import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "@/components/AppText";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { useTheme } from "@/theme/ThemeProvider";
import { useDownloadsStore } from "@/store/downloadsStore";
import { getApiBaseUrl } from "@/services/apiClient";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PdfViewer">;

const resolvePdfUrl = (raw: string): string => {
  if (!raw) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = getApiBaseUrl().split("/api/")[0];
  if (raw.startsWith("/media/")) return base + raw;
  if (raw.startsWith("media/")) return base + "/" + raw;
  return raw;
};

export default function PdfViewerScreen({ route, navigation }: Props) {
  const { title, fileUrl } = route.params;
  const resolvedFileUrl = resolvePdfUrl(fileUrl);
  const { colors, brand, radius } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const upsert = useDownloadsStore((s) => s.upsert);

  const fileName = (title || "document").replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "_") + ".pdf";
  const localUri = `${FileSystem.documentDirectory}${fileName}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, 20000);
    return () => clearTimeout(timer);
  }, [loading]);

  const downloadPdf = useCallback(async () => {
    try {
      setDownloading(true);
      const targetUri = `${FileSystem.documentDirectory}${fileName}`;
      let info = await FileSystem.getInfoAsync(targetUri);
      if (!info.exists) {
        await FileSystem.downloadAsync(resolvedFileUrl, targetUri);
        info = await FileSystem.getInfoAsync(targetUri);
      }
      upsert({
        lessonId: resolvedFileUrl,
        courseId: "pdf",
        title: title || fileName.replace(/\.pdf$/, ""),
        sizeBytes: info.exists ? (info.size ?? 0) : 0,
        encryptedLocalRef: targetUri,
        progressPercent: 100,
        status: "completed",
      });
      Alert.alert("Downloaded", "PDF save ho gaya, ab Downloads menu me available hai.");
    } catch {
      Alert.alert("Error", "PDF download nahi ho paya.");
    } finally {
      setDownloading(false);
    }
  }, [resolvedFileUrl, fileName, title, upsert]);

  const openInBrowser = () => Linking.openURL(resolvedFileUrl).catch(() => undefined);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <AppText style={styles.backIcon}>←</AppText>
        </Pressable>
        <AppText style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </AppText>
        <Pressable onPress={downloadPdf} disabled={downloading} style={styles.headerBtn}>
          <AppText style={{ color: brand.primary, fontSize: 12, fontWeight: "700" }}>
            {downloading ? "Saving..." : "⬇ Download"}
          </AppText>
        </Pressable>
      </View>

      {loading && !error && !timedOut && (
        <View style={styles.center}>
          <LoadingState label="Loading PDF..." />
        </View>
      )}

      {timedOut && !error && (
        <View style={styles.center}>
          <ErrorState message="PDF load ho rha hai lekin thoda time le rha hai. Internet check karein ya retry karein." onRetry={() => { setTimedOut(false); setLoading(true); }} />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <ErrorState message={error} onRetry={downloadPdf} />
        </View>
      )}

      <WebView
        source={{ uri: resolvedFileUrl }}
        style={{ flex: 1, backgroundColor: "#fff" }}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError("PDF load nahi hua. Internet check karke retry karein ya browser mein kholein.")}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="always"
        originWhitelist={["*"]}
        renderError={() => (
          <View style={styles.center}>
            <ErrorState message="PDF view nahi ho pa raha." onRetry={openInBrowser} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  backIcon: { color: "#fff", fontSize: 22 },
  headerTitle: { flex: 1, fontSize: 14, fontWeight: "600" },
  headerBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: "#1B2B4B" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
