/**
 * Color math and WCAG AA contrast validation.
 */

export interface RGB {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export function hexToRgb(hex: string): RGB {
  let clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) {
    return { r: 209, g: 46, b: 83 }; // Default crimson fallback
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, "0");
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Computes standard relative luminance per WCAG 2.1.
 */
export function getRelativeLuminance(rgb: RGB): number {
  const toLinear = (c: number) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates WCAG contrast ratio between two hex colors. (1:1 to 21:1)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjusts color lightness iteratively until it meets the target contrast ratio against backgroundHex.
 */
export function ensureContrast(
  foregroundHex: string,
  backgroundHex: string,
  minRatio = 4.5
): string {
  const bgRgb = hexToRgb(backgroundHex);
  const bgLum = getRelativeLuminance(bgRgb);
  const makeDarker = bgLum > 0.5;

  let fgRgb = hexToRgb(foregroundHex);
  let ratio = getContrastRatio(rgbToHex(fgRgb), backgroundHex);

  if (ratio >= minRatio) return rgbToHex(fgRgb);

  // Iteratively push toward black or white
  for (let i = 0; i < 20 && ratio < minRatio; i++) {
    if (makeDarker) {
      fgRgb = {
        r: Math.max(0, fgRgb.r - 14),
        g: Math.max(0, fgRgb.g - 14),
        b: Math.max(0, fgRgb.b - 14),
      };
    } else {
      fgRgb = {
        r: Math.min(255, fgRgb.r + 14),
        g: Math.min(255, fgRgb.g + 14),
        b: Math.min(255, fgRgb.b + 14),
      };
    }
    ratio = getContrastRatio(rgbToHex(fgRgb), backgroundHex);
  }

  return rgbToHex(fgRgb);
}
