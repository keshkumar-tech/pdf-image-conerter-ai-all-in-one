export const brand = {
  primary: "#1B2B4B",
  secondary: "#C9A227",
  gradientFrom: "#1B2B4B",
  gradientTo: "#2D3E63",
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

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const fontFamily = {
  primary: undefined, // falls back to system font; swap for 'PlusJakartaSans' once loaded via expo-font
  code: undefined,     // swap for 'JetBrainsMono' once loaded via expo-font
};

export type Palette = typeof lightPalette;
