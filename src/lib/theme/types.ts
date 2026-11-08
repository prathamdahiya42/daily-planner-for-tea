export type StyleType = "cozy" | "glow" | "paper";
export type ModeType = "light" | "dark" | "auto";

export interface ThemeTokens {
  cream: string;
  cream2: string;
  surface: string;
  surfaceHover: string;
  blush: string;
  peach: string;
  rose: string;
  berry: string;
  crimson: string;
  plum: string;
  plumSoft: string;
  border: string;
  him: string;
  her: string;
  glow?: string;
  pattern: string;
  statusOnline: string;
  statusTyping: string;
  statusE2EE: string;
}

export interface UserThemePrefs {
  style: StyleType;
  mode: ModeType;
  accent: string;
}

export const DEFAULT_THEME_PREFS: UserThemePrefs = {
  style: "cozy",
  mode: "auto",
  accent: "#D12E53", // Default crimson from logo
};

export const PRESET_ACCENTS: readonly { label: string; hex: string }[] = [
  { label: "Crimson Rose", hex: "#D12E53" },
  { label: "Warm Coral", hex: "#E05A47" },
  { label: "Honey Peach", hex: "#E88B58" },
  { label: "Sakura Blossom", hex: "#E86F98" },
  { label: "Velvet Plum", hex: "#9B3878" },
  { label: "Midnight Amethyst", hex: "#7B42BC" },
  { label: "Ocean Breeze", hex: "#2A84C8" },
  { label: "Eucalyptus Mint", hex: "#1D9E74" },
  { label: "Matcha Latte", hex: "#5C8C3E" },
  { label: "Golden Sun", hex: "#C78B14" },
];
