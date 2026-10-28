import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
}

/** Base layout wrapper every screen uses: safe-area aware, themed
 * background, optional scroll. Keeps padding/background consistent
 * across all 52 screens without repeating boilerplate. */
export function Screen({ children, scroll = true, padded = true, style, ...rest }: ScreenProps) {
  const { colors } = useTheme();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <Container
        style={[{ flex: 1 }, style]}
        contentContainerStyle={padded ? { padding: 16, paddingBottom: 32 } : undefined}
        {...(scroll ? rest : {})}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });
