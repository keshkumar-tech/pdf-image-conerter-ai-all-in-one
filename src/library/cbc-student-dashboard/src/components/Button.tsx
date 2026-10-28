import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = "primary", size = "md", loading, disabled, fullWidth, style }: ButtonProps) {
  const { colors, brand, radius } = useTheme();
  const bg = variant === "primary" ? brand.primary : variant === "danger" ? brand.danger : colors.surface;
  const textColor = variant === "secondary" ? colors.text : "#fff";
  const borderColor = variant === "secondary" ? colors.border : "transparent";

  const paddingVertical = size === "sm" ? 6 : size === "lg" ? 14 : 10;
  const paddingHorizontal = size === "sm" ? 12 : size === "lg" ? 20 : 16;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingVertical,
          paddingHorizontal,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "700", fontSize: 14 },
});
