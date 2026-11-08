import {
  STICKER_BY_ID,
  LEGACY_ALIASES,
  StickerEntry,
  StickerMood,
  StickerCategory,
  NOTO_STICKER_ENTRIES,
  CAPTION_STICKER_ENTRIES,
  TEA_STICKER_ENTRIES,
} from "./manifest";

export interface ResolvedSticker {
  id: string;
  name: string;
  file: string;
  fallbackFile: string;
  emoji: string;
  caption?: string;
  mood: StickerMood;
  isAnimated: boolean;
  category: StickerCategory;
}

const DEFAULT_FALLBACK: ResolvedSticker = {
  id: "sweet-01",
  name: "Bear Hug",
  file: "/stickers/sweet-01.svg",
  fallbackFile: "/stickers/sweet-01.svg",
  emoji: "🧸",
  mood: "sweet",
  isAnimated: false,
  category: "tea",
};

/**
 * Robust sticker resolver that accepts any input shape (message payload, raw ID, legacy path, or undefined)
 * and resolves it to a canonical, guaranteed renderable sticker definition.
 */
export function resolveSticker(input: unknown): ResolvedSticker {
  if (!input) return DEFAULT_FALLBACK;

  let rawId: string | undefined;
  let rawFile: string | undefined;

  if (typeof input === "string") {
    rawId = input.trim();
  } else if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    if (typeof obj.stickerId === "string") rawId = obj.stickerId.trim();
    if (typeof obj.stickerFile === "string") rawFile = obj.stickerFile.trim();
    if (!rawId && typeof obj.id === "string") rawId = obj.id.trim();
    if (!rawFile && typeof obj.file === "string") rawFile = obj.file.trim();
  }

  // 1. Check direct ID match in manifest
  if (rawId && STICKER_BY_ID.has(rawId)) {
    const entry = STICKER_BY_ID.get(rawId)!;
    return toResolved(entry);
  }

  // 2. Check legacy aliases by ID
  if (rawId && LEGACY_ALIASES[rawId]) {
    const canonicalId = LEGACY_ALIASES[rawId];
    if (STICKER_BY_ID.has(canonicalId)) {
      return toResolved(STICKER_BY_ID.get(canonicalId)!);
    }
  }

  // 3. Check legacy aliases by file path
  if (rawFile && LEGACY_ALIASES[rawFile]) {
    const canonicalId = LEGACY_ALIASES[rawFile];
    if (STICKER_BY_ID.has(canonicalId)) {
      return toResolved(STICKER_BY_ID.get(canonicalId)!);
    }
  }

  // 4. Try matching filename substring
  const searchStr = (rawFile || rawId || "").toLowerCase();
  if (searchStr) {
    for (const entry of NOTO_STICKER_ENTRIES) {
      const baseName = entry.id.replace("noto-", "");
      if (searchStr.includes(baseName)) {
        return toResolved(entry);
      }
    }

    for (const entry of CAPTION_STICKER_ENTRIES) {
      if (searchStr.includes(entry.id)) {
        return toResolved(entry);
      }
    }

    for (const entry of TEA_STICKER_ENTRIES) {
      if (searchStr.includes(entry.id)) {
        return toResolved(entry);
      }
    }
  }

  // 5. If rawFile points to an actual SVG on disk (e.g. starts with /stickers/), provide safe wrapper
  if (rawFile && rawFile.startsWith("/stickers/")) {
    return {
      id: rawId || "custom-sticker",
      name: "Cute Sticker",
      file: rawFile,
      fallbackFile: "/stickers/sweet-01.svg",
      emoji: "💕",
      mood: "sweet",
      isAnimated: false,
      category: "tea",
    };
  }

  return DEFAULT_FALLBACK;
}

function toResolved(entry: StickerEntry): ResolvedSticker {
  return {
    id: entry.id,
    name: entry.name,
    file: entry.file,
    fallbackFile: entry.fallbackFile || (entry.category === "cute" ? "/stickers/sweet-01.svg" : entry.file),
    emoji: entry.emoji,
    caption: entry.caption,
    mood: entry.mood,
    isAnimated: entry.isAnimated,
    category: entry.category,
  };
}
