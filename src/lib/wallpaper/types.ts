export type BlurAmount = 0 | 8 | 16;

export interface WallpaperPreset {
  id: string;
  name: string;
  cssGradient: string;
  previewColor: string;
}

export interface WallpaperRecord {
  id: string;
  type: "preset" | "custom";
  presetId?: string;
  originalBlob?: Blob;
  bakedBlob?: Blob; // Processed WebP blob with baked blur
  blur: BlurAmount;
  dim: number; // 0.0 - 0.70 (0% - 70%)
  createdAt: number;
}

export const WALLPAPER_PRESETS: readonly WallpaperPreset[] = [
  {
    id: "romantic-dawn",
    name: "Romantic Dawn",
    cssGradient: "linear-gradient(145deg, #fce4ec 0%, #ffe0b2 50%, #f8bbd0 100%)",
    previewColor: "#fce4ec",
  },
  {
    id: "midnight-velvet",
    name: "Midnight Velvet",
    cssGradient: "linear-gradient(160deg, #1f0b18 0%, #0d040a 50%, #160714 100%)",
    previewColor: "#1f0b18",
  },
  {
    id: "matcha-meadow",
    name: "Matcha Meadow",
    cssGradient: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #dcedc8 100%)",
    previewColor: "#e8f5e9",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    cssGradient: "linear-gradient(150deg, #f3e5f5 0%, #ede7f6 50%, #e1bee7 100%)",
    previewColor: "#f3e5f5",
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    cssGradient: "linear-gradient(135deg, #ffccbc 0%, #ffe0b2 50%, #f48fb1 100%)",
    previewColor: "#ffccbc",
  },
  {
    id: "starry-night",
    name: "Starry Night",
    cssGradient: "linear-gradient(180deg, #090a1a 0%, #171126 50%, #05050f 100%)",
    previewColor: "#090a1a",
  },
  {
    id: "rose-milk",
    name: "Rose Milk",
    cssGradient: "linear-gradient(140deg, #fff0f5 0%, #ffe4e1 50%, #fbc8d4 100%)",
    previewColor: "#fff0f5",
  },
  {
    id: "cozy-mocha",
    name: "Cozy Mocha",
    cssGradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 50%, #bcaaa4 100%)",
    previewColor: "#efebe9",
  },
];
