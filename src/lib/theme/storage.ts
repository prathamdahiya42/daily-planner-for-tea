import { UserThemePrefs, DEFAULT_THEME_PREFS, ModeType } from "./types";
import { deriveTheme } from "./deriveTheme";

const PREFS_STORAGE_KEY = "dp_prefs";
const LEGACY_THEME_KEY = "olr_theme";

// In-memory fallback if localStorage is unavailable
let memStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof globalThis !== "undefined" && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(key);
    }
  } catch {}
  return memStorage[key] || null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    if (typeof globalThis !== "undefined" && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
      (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memStorage[key] = value;
}

export function getStoredThemePrefs(): UserThemePrefs {
  try {
    const raw = getStorageItem(PREFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        style: parsed.style || DEFAULT_THEME_PREFS.style,
        mode: parsed.mode || DEFAULT_THEME_PREFS.mode,
        accent: parsed.accent || DEFAULT_THEME_PREFS.accent,
      };
    }
    // Check legacy key
    const legacy = getStorageItem(LEGACY_THEME_KEY);
    if (legacy === "midnight") {
      return { ...DEFAULT_THEME_PREFS, style: "glow", mode: "dark" };
    }
  } catch {}
  return DEFAULT_THEME_PREFS;
}

export function saveStoredThemePrefs(updates: Partial<UserThemePrefs>): UserThemePrefs {
  const current = getStoredThemePrefs();
  const next: UserThemePrefs = {
    ...current,
    ...updates,
  };
  try {
    setStorageItem(PREFS_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function resolveActiveMode(mode: ModeType): "light" | "dark" {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";

  if (typeof window === "undefined") return "light";

  // Auto mode: check night hours (8 PM - 6 AM) or system dark mode
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 20 || currentHour < 6;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isNight || prefersDark ? "dark" : "light";
}

/**
 * Applies custom theme CSS variables to a target chat root container.
 * Never modifies <html> or <body> attributes so the decoy remains completely neutral.
 */
export function applyThemeToElement(el: HTMLElement | null, prefs: UserThemePrefs) {
  if (!el) return;

  const activeMode = resolveActiveMode(prefs.mode);
  const tokens = deriveTheme(prefs.accent, activeMode, prefs.style);

  // Set data attributes scoped to this chat element
  el.setAttribute("data-style", prefs.style);
  el.setAttribute("data-mode", activeMode);

  // Inject CSS custom properties
  el.style.setProperty("--cream", tokens.cream);
  el.style.setProperty("--cream-2", tokens.cream2);
  el.style.setProperty("--surface", tokens.surface);
  el.style.setProperty("--surface-hover", tokens.surfaceHover);
  el.style.setProperty("--blush", tokens.blush);
  el.style.setProperty("--border", tokens.border);
  el.style.setProperty("--peach", tokens.peach);
  el.style.setProperty("--rose", tokens.rose);
  el.style.setProperty("--berry", tokens.berry);
  el.style.setProperty("--crimson", tokens.crimson);
  el.style.setProperty("--plum", tokens.plum);
  el.style.setProperty("--plum-soft", tokens.plumSoft);
  el.style.setProperty("--status-online", tokens.statusOnline);
  el.style.setProperty("--status-typing", tokens.statusTyping);
  el.style.setProperty("--status-e2ee", tokens.statusE2EE);

  if (tokens.glow) {
    el.style.setProperty("--theme-glow", tokens.glow);
  } else {
    el.style.removeProperty("--theme-glow");
  }

  // Update dynamic meta theme-color to eliminate white bar strips
  updateMetaThemeColor(tokens.cream);
}

/**
 * Removes all theme styling from an element on lock / quick-hide.
 */
export function clearThemeFromElement(el: HTMLElement | null) {
  if (!el) return;
  el.removeAttribute("data-style");
  el.removeAttribute("data-mode");
  const props = [
    "--cream", "--cream-2", "--surface", "--surface-hover", "--blush",
    "--border", "--peach", "--rose", "--berry", "--crimson",
    "--plum", "--plum-soft", "--status-online", "--status-typing",
    "--status-e2ee", "--theme-glow"
  ];
  props.forEach((p) => el.style.removeProperty(p));
  resetMetaThemeColor();
}

export function updateMetaThemeColor(color: string) {
  if (typeof document === "undefined") return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);
}

export function resetMetaThemeColor() {
  updateMetaThemeColor("#FFFFFF");
}
