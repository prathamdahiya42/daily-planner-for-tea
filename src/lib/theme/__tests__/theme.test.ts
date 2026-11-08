import { describe, it, expect } from "vitest";
import { deriveTheme } from "../deriveTheme";
import { getContrastRatio, ensureContrast } from "../contrast";
import { StyleType } from "../types";
import { getStoredThemePrefs, saveStoredThemePrefs, resolveActiveMode } from "../storage";

describe("Phase B: 3 Switchable Styles & OKLCH Custom Color Engine", () => {
  const styles: StyleType[] = ["cozy", "glow", "paper"];
  const modes: ("light" | "dark")[] = ["light", "dark"];

  it("derives all tokens for every style and mode combination with WCAG AA compliance", () => {
    const accent = "#D12E53";

    for (const style of styles) {
      for (const mode of modes) {
        const tokens = deriveTheme(accent, mode, style);

        expect(tokens.cream).toBeDefined();
        expect(tokens.surface).toBeDefined();
        expect(tokens.plum).toBeDefined();
        expect(tokens.plumSoft).toBeDefined();
        expect(tokens.crimson).toBeDefined();
        expect(tokens.statusOnline).toBeDefined();
        expect(tokens.statusE2EE).toBeDefined();

        // Check WCAG AA contrast (min 4.5:1)
        const plumOnSurface = getContrastRatio(tokens.plum, tokens.surface);
        const plumOnCream = getContrastRatio(tokens.plum, tokens.cream);
        const plumSoftOnSurface = getContrastRatio(tokens.plumSoft, tokens.surface);
        const statusOnlineOnCream = getContrastRatio(tokens.statusOnline, tokens.cream);
        const statusE2EEOnCream = getContrastRatio(tokens.statusE2EE, tokens.cream);

        expect(plumOnSurface).toBeGreaterThanOrEqual(4.5);
        expect(plumOnCream).toBeGreaterThanOrEqual(4.5);
        expect(plumSoftOnSurface).toBeGreaterThanOrEqual(4.5);
        expect(statusOnlineOnCream).toBeGreaterThanOrEqual(4.5);
        expect(statusE2EEOnCream).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("guarantees WCAG AA contrast even for extreme and low-contrast accent inputs", () => {
    const challengingAccents = [
      "#FFFFFF", // Pure white
      "#000000", // Pure black
      "#FFFF00", // Bright neon yellow
      "#00FF66", // Bright neon green
      "#FFECEC", // Extremely pale pink
      "#120208", // Near-black plum
      "#808080", // Mid-gray
    ];

    for (const accent of challengingAccents) {
      for (const style of styles) {
        for (const mode of modes) {
          const tokens = deriveTheme(accent, mode, style);

          const contrast = getContrastRatio(tokens.plum, tokens.surface);
          expect(contrast).toBeGreaterThanOrEqual(4.5);

          const statusContrast = getContrastRatio(tokens.statusOnline, tokens.cream);
          expect(statusContrast).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("ensures ensureContrast pushes foreground to meet or exceed target ratio", () => {
    const bg = "#FFFFFF";
    const weakGray = "#DDDDDD";

    expect(getContrastRatio(weakGray, bg)).toBeLessThan(4.5);
    const guarded = ensureContrast(weakGray, bg, 4.5);
    expect(getContrastRatio(guarded, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("persists and retrieves theme preferences under neutral key dp_prefs", () => {
    const saved = saveStoredThemePrefs({
      style: "glow",
      mode: "dark",
      accent: "#7B42BC",
    });

    expect(saved.style).toBe("glow");
    expect(saved.mode).toBe("dark");
    expect(saved.accent).toBe("#7B42BC");

    const retrieved = getStoredThemePrefs();
    expect(retrieved.style).toBe("glow");
    expect(retrieved.mode).toBe("dark");
    expect(retrieved.accent).toBe("#7B42BC");
  });
});
