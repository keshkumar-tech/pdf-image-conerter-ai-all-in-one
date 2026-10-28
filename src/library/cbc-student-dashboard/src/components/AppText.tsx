import { Text, type TextProps } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface AppTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "muted";
}

const sizes: Record<string, { fontSize: number; fontWeight: "400" | "600" | "700" | "800" }> = {
  h1: { fontSize: 26, fontWeight: "800" },
  h2: { fontSize: 20, fontWeight: "700" },
  h3: { fontSize: 16, fontWeight: "700" },
  body: { fontSize: 14, fontWeight: "400" },
  caption: { fontSize: 12, fontWeight: "400" },
  muted: { fontSize: 13, fontWeight: "400" },
};

export function AppText({ variant = "body", style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const isMuted = variant === "muted" || variant === "caption";
  return (
    <Text
      style={[sizes[variant], { color: isMuted ? colors.muted : colors.text }, style]}
      {...rest}
    />
  );
}
