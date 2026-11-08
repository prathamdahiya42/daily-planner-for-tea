import {
  StickerMood,
  StickerCategory,
  StickerEntry,
  NOTO_STICKER_ENTRIES,
  CAPTION_STICKER_ENTRIES,
  TEA_STICKER_ENTRIES,
  ALL_STICKER_ENTRIES,
} from "./manifest";
import { resolveSticker, ResolvedSticker } from "./resolver";

export type { StickerMood, StickerCategory, StickerEntry, ResolvedSticker };

export interface StickerDef {
  id: string;
  name: string;
  file: string;
  mood: StickerMood;
  animated: boolean;
  category?: StickerCategory;
  emoji?: string;
  caption?: string;
  description?: string;
}

export const STICKER_PACK: readonly StickerDef[] = TEA_STICKER_ENTRIES.map((e) => ({
  id: e.id,
  name: e.name,
  file: e.file,
  mood: e.mood,
  animated: e.isAnimated,
  category: e.category,
  emoji: e.emoji,
  description: e.description,
}));

export const NOTO_STICKER_PACK: readonly StickerDef[] = NOTO_STICKER_ENTRIES.map((e) => ({
  id: e.id,
  name: e.name,
  file: e.file,
  mood: e.mood,
  animated: e.isAnimated,
  category: e.category,
  emoji: e.emoji,
  description: e.description,
}));

export const CAPTION_STICKER_PACK: readonly StickerDef[] = CAPTION_STICKER_ENTRIES.map((e) => ({
  id: e.id,
  name: e.name,
  file: e.file,
  mood: e.mood,
  animated: e.isAnimated,
  category: e.category,
  emoji: e.emoji,
  caption: e.caption,
  description: e.description,
}));

export const ALL_STICKERS: readonly StickerDef[] = [
  ...NOTO_STICKER_PACK,
  ...CAPTION_STICKER_PACK,
  ...STICKER_PACK,
];

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
 */
export function getStickerOfTheDay(date = new Date()): StickerDef {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const index = Math.abs(hash) % STICKER_PACK.length;
  return STICKER_PACK[index];
}

export function isStickerOfTheDay(stickerId: string, date = new Date()): boolean {
  const todaySticker = getStickerOfTheDay(date);
  return todaySticker.id === stickerId;
}

export function getRandomSticker(mood?: StickerMood | "all"): StickerDef {
  const filtered =
    !mood || mood === "all" ? STICKER_PACK : STICKER_PACK.filter((s) => s.mood === mood);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

export function getRandomCuteSticker(): StickerDef {
  const randomIndex = Math.floor(Math.random() * NOTO_STICKER_PACK.length);
  return NOTO_STICKER_PACK[randomIndex];
}

export function getStickerById(id: string): StickerDef | undefined {
  const resolved = resolveSticker(id);
  if (resolved) {
    return {
      id: resolved.id,
      name: resolved.name,
      file: resolved.file,
      mood: resolved.mood,
      animated: resolved.isAnimated,
      category: resolved.category,
      emoji: resolved.emoji,
      caption: resolved.caption,
    };
  }
  return ALL_STICKERS.find((s) => s.id === id) || STICKER_PACK.find((s) => s.id === id);
}

// Neutral storage key for PWA decoy rule
const RECENT_STICKERS_KEY = "dp_recents";
const LEGACY_RECENT_STICKERS_KEY = "olr_recent_stickers";

export function getRecentStickerIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_STICKERS_KEY) || localStorage.getItem(LEGACY_RECENT_STICKERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveRecentStickerId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const recents = getRecentStickerIds().filter((r) => r !== id);
    recents.unshift(id);
    const trimmed = recents.slice(0, 12);
    localStorage.setItem(RECENT_STICKERS_KEY, JSON.stringify(trimmed));
  } catch {}
}

export { resolveSticker };
