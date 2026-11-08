"use client";

export type ThemeMode = "blush" | "midnight" | "auto";

const THEME_KEY = "olr_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "blush" || saved === "midnight" || saved === "auto") {
      return saved;
    }
  } catch {}
  return "auto";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {}

  let isDark = false;
  if (mode === "midnight") {
    isDark = true;
  } else if (mode === "blush") {
    isDark = false;
  } else {
    // "auto": switch to midnight at 8 PM (20:00) until 6 AM (06:00), or if prefers-color-scheme is dark
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 20 || currentHour < 6;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    isDark = isNight || systemPrefersDark;
  }

  const root = document.documentElement;
  if (isDark) {
    root.setAttribute("data-theme", "dark");
    document.body.classList.add("dark");
  } else {
    root.setAttribute("data-theme", "light");
    document.body.classList.remove("dark");
  }
}
