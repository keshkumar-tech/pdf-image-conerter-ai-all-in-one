import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { useTheme } from "@/theme/ThemeProvider";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  const { brand } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={brand.primary} size="large" />
      <AppText variant="muted" style={{ marginTop: 12 }}>{label}</AppText>
    </View>
  );
}

export function EmptyState({ title = "Nothing here yet", description }: { title?: string; description?: string }) {
  return (
    <View style={styles.center}>
      <AppText variant="h3">{title}</AppText>
      {description && <AppText variant="muted" style={{ marginTop: 6, textAlign: "center" }}>{description}</AppText>}
    </View>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }: { message?: string; onRetry?: () => void }) {
  const { brand } = useTheme();
  return (
    <View style={styles.center}>
      <AppText variant="h3" style={{ color: brand.danger }}>{message}</AppText>
      {onRetry && <Button label="Retry" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <AppText variant="h3">You're offline</AppText>
      <AppText variant="muted" style={{ marginTop: 6, textAlign: "center" }}>
        Check your connection. Downloaded lessons are still available in Offline Manager.
      </AppText>
      {onRetry && <Button label="Try again" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 12 },
});
