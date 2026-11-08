export type StickerMood = "sweet" | "silly" | "sorry" | "missyou" | "goodnight";

export interface StickerDef {
  id: string;
  name: string;
  file: string;
  mood: StickerMood;
  animated: boolean;
  description?: string;
}

// Static bundle of 40 stickers matching public/stickers/manifest.json
import rawManifest from "../../../public/stickers/manifest.json";

export const STICKER_PACK: readonly StickerDef[] = rawManifest as StickerDef[];

export const MOOD_TABS: readonly { id: StickerMood | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "✨" },
  { id: "sweet", label: "Sweet", icon: "💕" },
  { id: "silly", label: "Silly", icon: "😜" },
  { id: "sorry", label: "Sorry", icon: "🥺" },
  { id: "missyou", label: "Miss You", icon: "🧸" },
  { id: "goodnight", label: "Goodnight", icon: "🌙" },
];

/**
 * Deterministically computes the Sticker of the Day for any date (YYYY-MM-DD).
 * The same date always yields the exact same sticker.
 */
export function getStickerOfTheDay(date = new Date()): StickerDef {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Simple deterministic integer hash of date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const index = Math.abs(hash) % STICKER_PACK.length;
  return STICKER_PACK[index];
}

/**
 * Returns whether a given sticker ID is the unlocked Sticker of the Day for today.
 */
export function isStickerOfTheDay(stickerId: string, date = new Date()): boolean {
  const todaySticker = getStickerOfTheDay(date);
  return todaySticker.id === stickerId;
}

/**
 * Pick a random sticker, optionally filtered by a specific mood.
 */
export function getRandomSticker(mood?: StickerMood | "all"): StickerDef {
  const filtered =
    !mood || mood === "all" ? STICKER_PACK : STICKER_PACK.filter((s) => s.mood === mood);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Find sticker definition by ID
 */
export function getStickerById(id: string): StickerDef | undefined {
  return STICKER_PACK.find((s) => s.id === id);
}
