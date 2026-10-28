export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const brand = {
  primary: "#6C5CE7",
  secondary: "#22D3EE",
  gradientFrom: "#6C5CE7",
  gradientTo: "#8B7CFF",
  success: "#12B76A",
  warning: "#F79009",
  danger: "#F04438",
};

export const lightPalette = {
  background: "#F6F7FB",
  surface: "#FFFFFF",
  text: "#111827",
  muted: "#667085",
  border: "#E4E7EC",
};

export const darkPalette = {
  background: "#0B1220",
  surface: "#111827",
  text: "#F9FAFB",
  muted: "#98A2B3",
  border: "#253047",
};

export const spacingScale = [4, 8, 12, 16, 24, 32, 40, 48, 64];
export const radiusScale = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const fontFamily = {
  primary: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  code: "'JetBrains Mono', 'Fira Code', monospace",
};
