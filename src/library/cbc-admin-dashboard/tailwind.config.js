/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6C5CE7", light: "#8B7CFF" },
        secondary: "#22D3EE",
        success: "#12B76A",
        warning: "#F79009",
        danger: "#F04438",
        surface: { light: "#FFFFFF", dark: "#111827" },
        bg: { light: "#F6F7FB", dark: "#0B1220" },
        text: { light: "#111827", dark: "#F9FAFB" },
        muted: { light: "#667085", dark: "#98A2B3" },
        border: { light: "#E4E7EC", dark: "#253047" },
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px", full: "999px" },
      spacing: { 18: "4.5rem" },
    },
  },
  plugins: [],
};
