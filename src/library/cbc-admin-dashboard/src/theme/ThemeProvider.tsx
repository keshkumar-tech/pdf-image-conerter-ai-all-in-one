import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { brand, darkPalette, lightPalette, type ResolvedTheme, type ThemeMode } from "./tokens";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "cwk-admin-theme-preference";

function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyPaletteToDom(resolved: ResolvedTheme) {
  const palette = resolved === "dark" ? darkPalette : lightPalette;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.setProperty("--color-background", palette.background);
  root.style.setProperty("--color-surface", palette.surface);
  root.style.setProperty("--color-text", palette.text);
  root.style.setProperty("--color-muted", palette.muted);
  root.style.setProperty("--color-border", palette.border);
  root.style.setProperty("--color-primary", brand.primary);
  root.style.setProperty("--color-secondary", brand.secondary);
  root.style.setProperty("--color-success", brand.success);
  root.style.setProperty("--color-warning", brand.warning);
  root.style.setProperty("--color-danger", brand.danger);
  root.style.setProperty(
    "--gradient-primary",
    `linear-gradient(135deg, ${brand.gradientFrom}, ${brand.gradientTo})`
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    return (stored as ThemeMode) || "system";
  });

  const resolved: ResolvedTheme = mode === "system" ? getSystemPreference() : mode;

  useEffect(() => {
    applyPaletteToDom(resolved);
  }, [resolved]);

  useEffect(() => {
    if (mode !== "system" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyPaletteToDom(getSystemPreference());
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
