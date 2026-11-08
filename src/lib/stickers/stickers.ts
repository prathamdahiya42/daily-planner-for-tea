export type StickerMood = "sweet" | "silly" | "sorry" | "missyou" | "goodnight";

export interface StickerDef {
  id: string;
  name: string;
  file: string;
  mood: StickerMood;
  animated: boolean;
  category?: "tea" | "noto" | "caption";
  description?: string;
}

// Static bundle of 40 stickers matching public/stickers/manifest.json (Tea Pack)
import rawManifest from "../../../public/stickers/manifest.json";

export const STICKER_PACK: readonly StickerDef[] = rawManifest as StickerDef[];

// 24 Noto Animated Emoji Pack (Phase 4.1)
export const NOTO_STICKER_PACK: readonly StickerDef[] = [
  { id: "noto-bear", name: "Cute Bear", file: "/stickers/noto/bear.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-sparkling-heart", name: "Sparkling Heart", file: "/stickers/noto/sparkling-heart.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-blowing-kiss", name: "Blowing Kiss", file: "/stickers/noto/blowing-kiss.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-hug", name: "Warm Hug", file: "/stickers/noto/hug.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-pleading-face", name: "Pleading Eyes", file: "/stickers/noto/pleading-face.svg", mood: "sorry", animated: true, category: "noto" },
  { id: "noto-party-face", name: "Party Time", file: "/stickers/noto/party-face.svg", mood: "silly", animated: true, category: "noto" },
  { id: "noto-tea-cup", name: "Cozy Tea", file: "/stickers/noto/tea-cup.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-cat-heart-eyes", name: "Cat Heart Eyes", file: "/stickers/noto/cat-heart-eyes.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-blushing-cat", name: "Blushing Kitty", file: "/stickers/noto/blushing-cat.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-cute-monkey", name: "Sweet Monkey", file: "/stickers/noto/cute-monkey.svg", mood: "silly", animated: true, category: "noto" },
  { id: "noto-fire-heart", name: "Love Flame", file: "/stickers/noto/fire-heart.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-butterfly", name: "Flutter Butterfly", file: "/stickers/noto/butterfly.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-love-letter", name: "Love Letter", file: "/stickers/noto/love-letter.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-holding-hands", name: "Holding Hands", file: "/stickers/noto/holding-hands.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-sleeping-face", name: "Sleeping Zzz", file: "/stickers/noto/sleeping-face.svg", mood: "goodnight", animated: true, category: "noto" },
  { id: "noto-smiling-eyes", name: "Warm Smile", file: "/stickers/noto/smiling-eyes.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-blushing-sun", name: "Blushing Sun", file: "/stickers/noto/blushing-sun.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-blooming-rose", name: "Sweet Rose", file: "/stickers/noto/blooming-rose.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-bunny-hop", name: "Bunny Hop", file: "/stickers/noto/bunny-hop.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-cupcake", name: "Sweet Cupcake", file: "/stickers/noto/cupcake.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-sparkles", name: "Sparkles", file: "/stickers/noto/sparkles.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-warm-hug", name: "Bear & Bunny", file: "/stickers/noto/warm-hug.svg", mood: "sweet", animated: true, category: "noto" },
  { id: "noto-star-eyes", name: "Star Eyes", file: "/stickers/noto/star-eyes.svg", mood: "silly", animated: true, category: "noto" },
  { id: "noto-melting-face", name: "Melting For You", file: "/stickers/noto/melting-face.svg", mood: "sweet", animated: true, category: "noto" },
];

// 12 Caption Phrase Stickers (Phase 4.2)
export const CAPTION_STICKER_PACK: readonly StickerDef[] = [
  { id: "caption-come-talk", name: "come talk to me", file: "/stickers/captions/caption-come-talk.svg", mood: "missyou", animated: false, category: "caption" },
  { id: "caption-miss-you", name: "miss you", file: "/stickers/captions/caption-miss-you.svg", mood: "missyou", animated: false, category: "caption" },
  { id: "caption-drink-tea", name: "drink your tea", file: "/stickers/captions/caption-drink-tea.svg", mood: "sweet", animated: false, category: "caption" },
  { id: "caption-proud-of-you", name: "proud of you", file: "/stickers/captions/caption-proud-of-you.svg", mood: "sweet", animated: false, category: "caption" },
  { id: "caption-call-me", name: "call me when you're free", file: "/stickers/captions/caption-call-me.svg", mood: "missyou", animated: false, category: "caption" },
  { id: "caption-good-morning", name: "good morning sweetheart", file: "/stickers/captions/caption-good-morning.svg", mood: "sweet", animated: false, category: "caption" },
  { id: "caption-sweet-dreams", name: "sweet dreams", file: "/stickers/captions/caption-sweet-dreams.svg", mood: "goodnight", animated: false, category: "caption" },
  { id: "caption-you-got-this", name: "you got this", file: "/stickers/captions/caption-you-got-this.svg", mood: "sweet", animated: false, category: "caption" },
  { id: "caption-on-my-way", name: "on my way", file: "/stickers/captions/caption-on-my-way.svg", mood: "sweet", animated: false, category: "caption" },
  { id: "caption-thinking-of-you", name: "thinking of you", file: "/stickers/captions/caption-thinking-of-you.svg", mood: "missyou", animated: false, category: "caption" },
  { id: "caption-hug-me", name: "hug me", file: "/stickers/captions/caption-hug-me.svg", mood: "sweet", animated: false, category: "caption" },
  { id: "caption-mine", name: "mine", file: "/stickers/captions/caption-mine.svg", mood: "sweet", animated: false, category: "caption" },
];

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
  return ALL_STICKERS.find((s) => s.id === id) || STICKER_PACK.find((s) => s.id === id);
}

const RECENT_STICKERS_KEY = "olr_recent_stickers";

export function getRecentStickerIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_STICKERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveRecentStickerId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const recents = getRecentStickerIds().filter((r) => r !== id);
    recents.unshift(id);
    const trimmed = recents.slice(0, 8); // Keep last 8 (Phase 4.3)
    localStorage.setItem(RECENT_STICKERS_KEY, JSON.stringify(trimmed));
  } catch {}
}
