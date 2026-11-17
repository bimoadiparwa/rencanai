import { useSyncExternalStore } from "react";
import { en, type Dict, type DictKey } from "./en";
import { id } from "./id";

export type Lang = "en" | "id";

const DICTS: Record<Lang, Dict> = { en, id };
const STORAGE_KEY = "rencanai-lang";

// Module-level singleton so non-React code (lib/ai, lib/connection, lib/providers)
// can translate too. React components subscribe via useLang() for re-renders.

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    // SSR or storage blocked; fall through to default.
  }
  return "en";
}

let current: Lang = detectLang();
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang): void {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // storage blocked; keep in-memory only
  }
  document.documentElement.lang = lang === "id" ? "id" : "en";
  for (const fn of listeners) fn();
}

export function subscribeLang(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function interpolate(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (m, key: string) =>
    key in vars ? vars[key] : m
  );
}

/** Translate a key in the current language, interpolating {{vars}}. */
export function t(key: DictKey, vars?: Record<string, string>): string {
  return interpolate(DICTS[current][key] ?? en[key] ?? key, vars);
}

/** React hook: re-renders the component when the language changes. */
export function useLang(): { lang: Lang; t: typeof t } {
  const lang = useSyncExternalStore(subscribeLang, getLang, getLang);
  return { lang, t };
}

/** Locale tag for Intl APIs matching the UI language. */
export function intlLocale(lang: Lang): string {
  return lang === "id" ? "id-ID" : "en-US";
}

export type { DictKey };
