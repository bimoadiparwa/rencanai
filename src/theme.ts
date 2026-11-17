import type { Theme } from "./types";

// Applies the theme to <html> so the .dark token overrides in index.css take
// effect. "system" follows prefers-color-scheme and keeps following it live.

const DARK_QUERY = "(prefers-color-scheme: dark)";

const THEME_COLOR = { light: "#fafafa", dark: "#0a0a0b" } as const;

function systemPrefersDark(): boolean {
  return typeof matchMedia !== "undefined" && matchMedia(DARK_QUERY).matches;
}

export function resolvedTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

export function applyTheme(theme: Theme): void {
  const resolved = resolvedTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[resolved]);
}

/** Re-apply on OS scheme changes while the user is on "system". Returns a cleanup. */
export function watchSystemTheme(getTheme: () => Theme): () => void {
  if (typeof matchMedia === "undefined") return () => {};
  const mq = matchMedia(DARK_QUERY);
  const handler = () => {
    if (getTheme() === "system") applyTheme("system");
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
