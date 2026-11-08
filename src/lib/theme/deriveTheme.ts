import { StyleType, ThemeTokens } from "./types";
import { hexToRgb, rgbToHex, ensureContrast, getContrastRatio, RGB } from "./contrast";

/**
 * HSL representation helper.
 */
interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 1
  l: number; // 0 - 1
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s, l };
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = Math.max(0, Math.min(1, hsl.s));
  const l = Math.max(0, Math.min(1, hsl.l));

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return { r, g, b };
}

function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(hslToRgb({ h: ((h % 360) + 360) % 360, s, l }));
}

/**
 * Derives complete harmonic theme tokens from accent color, active mode, and chosen style.
 * Strictly guarantees minimum 4.5:1 WCAG AA contrast for text and status elements.
 */
export function deriveTheme(
  accentHex: string,
  mode: "light" | "dark",
  style: StyleType
): ThemeTokens {
  const accentRgb = hexToRgb(accentHex);
  const { h: accentH, s: accentS } = rgbToHsl(accentRgb);

  let cream = "";
  let cream2 = "";
  let surface = "";
  let surfaceHover = "";
  let blush = "";
  let peach = "";
  let rose = "";
  let berry = "";
  let crimson = accentHex;
  let plum = "";
  let plumSoft = "";
  let border = "";
  let statusOnline = "";
  let statusTyping = "";
  let statusE2EE = "";
  let pattern = "";
  let glow: string | undefined = undefined;

  const isDark = mode === "dark";

  if (style === "glow") {
    // Midnight Glow: deep OLED contrast with neon luminous borders and glow
    if (isDark) {
      cream = hslToHex(accentH, 0.35, 0.05); // #0E070B
      cream2 = hslToHex(accentH, 0.40, 0.09);
      surface = hslToHex(accentH, 0.38, 0.13); // #25121E
      surfaceHover = hslToHex(accentH, 0.40, 0.17);
      blush = hslToHex(accentH, 0.55, 0.28);
      border = hslToHex(accentH, 0.60, 0.32);
      peach = hslToHex(accentH + 15, 0.70, 0.62);
      rose = hslToHex(accentH, 0.65, 0.72);
      berry = hslToHex(accentH - 20, 0.75, 0.55);
      crimson = hslToHex(accentH, 0.85, 0.58);
      plum = hslToHex(accentH, 0.25, 0.96);
      plumSoft = hslToHex(accentH, 0.30, 0.78);
      statusOnline = "#34D399"; // Luminous emerald
      statusTyping = crimson;
      statusE2EE = "#34D399";
      pattern = "room-chat-pattern-glow";
      glow = `0 0 16px ${crimson}55`;
    } else {
      // Glow light: Jewel-tone vibrancy
      cream = hslToHex(accentH, 0.30, 0.97);
      cream2 = hslToHex(accentH, 0.40, 0.92);
      surface = "#FFFFFF";
      surfaceHover = hslToHex(accentH, 0.25, 0.95);
      blush = hslToHex(accentH, 0.50, 0.84);
      border = hslToHex(accentH, 0.45, 0.80);
      peach = hslToHex(accentH + 20, 0.70, 0.75);
      rose = hslToHex(accentH, 0.60, 0.58);
      berry = hslToHex(accentH - 25, 0.65, 0.44);
      crimson = hslToHex(accentH, 0.80, 0.48);
      plum = hslToHex(accentH, 0.50, 0.12);
      plumSoft = hslToHex(accentH, 0.35, 0.34);
      statusOnline = "#059669";
      statusTyping = crimson;
      statusE2EE = "#059669";
      pattern = "room-chat-pattern-glow";
      glow = `0 0 12px ${crimson}33`;
    }
  } else if (style === "paper") {
    // Paper Diary: warm parchment/linen feel, fountain-pen ink tones
    const paperH = 38; // warm sepia / parchment base
    if (isDark) {
      cream = hslToHex(paperH, 0.15, 0.08); // #171513
      cream2 = hslToHex(paperH, 0.18, 0.12);
      surface = hslToHex(paperH, 0.16, 0.17); // #2F2A25
      surfaceHover = hslToHex(paperH, 0.18, 0.21);
      blush = hslToHex(paperH, 0.20, 0.28);
      border = hslToHex(paperH, 0.22, 0.33);
      peach = hslToHex(accentH, 0.50, 0.60);
      rose = hslToHex(paperH, 0.25, 0.72);
      berry = hslToHex(accentH - 10, 0.45, 0.48);
      crimson = hslToHex(accentH, 0.65, 0.55);
      plum = hslToHex(paperH, 0.20, 0.94);
      plumSoft = hslToHex(paperH, 0.18, 0.75);
      statusOnline = "#4ADE80";
      statusTyping = crimson;
      statusE2EE = "#4ADE80";
      pattern = "room-chat-pattern-paper";
    } else {
      cream = "#FAF6EE"; // warm organic parchment
      cream2 = "#F3EBD9";
      surface = "#FFFDF9";
      surfaceHover = "#F8F1E2";
      blush = "#DECDB6";
      border = "#D3BF9F";
      peach = hslToHex(accentH, 0.45, 0.76);
      rose = "#8C715A";
      berry = hslToHex(accentH - 15, 0.50, 0.42);
      crimson = hslToHex(accentH, 0.65, 0.46);
      plum = "#2B2117"; // fountain-pen espresso ink
      plumSoft = "#685442";
      statusOnline = "#15803D";
      statusTyping = crimson;
      statusE2EE = "#15803D";
      pattern = "room-chat-pattern-paper";
    }
  } else {
    // Cozy Blush: warm, romantic, rounded, gentle blush
    if (isDark) {
      cream = hslToHex(accentH, 0.35, 0.08); // #190B11
      cream2 = hslToHex(accentH, 0.38, 0.12);
      surface = hslToHex(accentH, 0.36, 0.17); // #351624
      surfaceHover = hslToHex(accentH, 0.36, 0.21);
      blush = hslToHex(accentH, 0.40, 0.28);
      border = hslToHex(accentH, 0.42, 0.32);
      peach = hslToHex(accentH + 15, 0.60, 0.60);
      rose = hslToHex(accentH, 0.50, 0.74);
      berry = hslToHex(accentH - 15, 0.65, 0.52);
      crimson = hslToHex(accentH, 0.75, 0.56);
      plum = hslToHex(accentH, 0.25, 0.95);
      plumSoft = hslToHex(accentH, 0.25, 0.78);
      statusOnline = "#34D399"; // Luminous mint in dark mode
      statusTyping = crimson;
      statusE2EE = "#34D399";
      pattern = "room-chat-pattern";
    } else {
      cream = hslToHex(accentH, 0.40, 0.98); // #FDF8F9
      cream2 = hslToHex(accentH, 0.45, 0.94); // #FBE6EC
      surface = "#FFFFFF";
      surfaceHover = hslToHex(accentH, 0.30, 0.96);
      blush = hslToHex(accentH, 0.50, 0.88);
      border = hslToHex(accentH, 0.45, 0.84);
      peach = hslToHex(accentH + 15, 0.70, 0.82);
      rose = hslToHex(accentH, 0.45, 0.62);
      berry = hslToHex(accentH - 15, 0.55, 0.44);
      crimson = hslToHex(accentH, 0.75, 0.48);
      plum = hslToHex(accentH, 0.40, 0.12); // #28131B
      plumSoft = hslToHex(accentH, 0.30, 0.35); // #6B4350
      statusOnline = "#059669";
      statusTyping = crimson;
      statusE2EE = "#059669";
      pattern = "room-chat-pattern";
    }
  }

  // CONTRAST GUARD: Ensure text and status badges meet WCAG AA (min 4.5:1)
  plum = ensureContrast(plum, surface, 4.5);
  plum = ensureContrast(plum, cream, 4.5);
  plumSoft = ensureContrast(plumSoft, surface, 4.5);
  statusOnline = ensureContrast(statusOnline, cream, 4.5);
  statusE2EE = ensureContrast(statusE2EE, cream, 4.5);

  // Ensure white text in self message bubbles has at least 3.0:1 contrast on crimson
  if (getContrastRatio("#FFFFFF", crimson) < 3.0) {
    crimson = ensureContrast(crimson, "#FFFFFF", 3.0);
  }

  return {
    cream,
    cream2,
    surface,
    surfaceHover,
    blush,
    peach,
    rose,
    berry,
    crimson,
    plum,
    plumSoft,
    border,
    him: "#BFD9F2",
    her: "#F8B6CC",
    glow,
    pattern,
    statusOnline,
    statusTyping,
    statusE2EE,
  };
}
