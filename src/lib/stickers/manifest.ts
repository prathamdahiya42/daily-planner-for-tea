export type StickerMood = "sweet" | "silly" | "sorry" | "missyou" | "goodnight";
export type StickerKind = "animated" | "static" | "caption" | "legacy";
export type StickerCategory = "cute" | "captions" | "tea";

export interface StickerEntry {
  id: string;
  name: string;
  file: string;
  fallbackFile?: string;
  mood: StickerMood;
  isAnimated: boolean;
  category: StickerCategory;
  emoji: string;
  caption?: string;
  description?: string;
}

// 24 Noto Animated Emoji Pack
export const NOTO_STICKER_ENTRIES: readonly StickerEntry[] = [
  { id: "noto-bear", name: "Cute Bear", file: "/stickers/noto/bear.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🐻", description: "Cute animated bear" },
  { id: "noto-sparkling-heart", name: "Sparkling Heart", file: "/stickers/noto/sparkling-heart.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "💖", description: "Sparkling animated heart" },
  { id: "noto-blowing-kiss", name: "Blowing Kiss", file: "/stickers/noto/blowing-kiss.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "😘", description: "Blowing a sweet kiss" },
  { id: "noto-hug", name: "Warm Hug", file: "/stickers/noto/hug.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🤗", description: "Warm hug" },
  { id: "noto-pleading-face", name: "Pleading Eyes", file: "/stickers/noto/pleading-face.svg", mood: "sorry", isAnimated: true, category: "cute", emoji: "🥺", description: "Pleading cute eyes" },
  { id: "noto-party-face", name: "Party Time", file: "/stickers/noto/party-face.svg", mood: "silly", isAnimated: true, category: "cute", emoji: "🥳", description: "Celebrating together" },
  { id: "noto-tea-cup", name: "Cozy Tea", file: "/stickers/noto/tea-cup.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🍵", description: "Warm cozy cup of tea" },
  { id: "noto-cat-heart-eyes", name: "Cat Heart Eyes", file: "/stickers/noto/cat-heart-eyes.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "😻", description: "Cat with heart eyes" },
  { id: "noto-blushing-cat", name: "Blushing Kitty", file: "/stickers/noto/blushing-cat.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "😽", description: "Sweet blushing cat" },
  { id: "noto-cute-monkey", name: "Sweet Monkey", file: "/stickers/noto/cute-monkey.svg", mood: "silly", isAnimated: true, category: "cute", emoji: "🐵", description: "Cute monkey giggle" },
  { id: "noto-fire-heart", name: "Love Flame", file: "/stickers/noto/fire-heart.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "❤️‍🔥", description: "Heart on fire with love" },
  { id: "noto-butterfly", name: "Flutter Butterfly", file: "/stickers/noto/butterfly.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🦋", description: "Fluttering butterfly" },
  { id: "noto-love-letter", name: "Love Letter", file: "/stickers/noto/love-letter.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "💌", description: "Sealed love letter" },
  { id: "noto-holding-hands", name: "Holding Hands", file: "/stickers/noto/holding-hands.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🤝", description: "Hands holding tightly" },
  { id: "noto-sleeping-face", name: "Sleeping Zzz", file: "/stickers/noto/sleeping-face.svg", mood: "goodnight", isAnimated: true, category: "cute", emoji: "😴", description: "Sleeping quietly" },
  { id: "noto-smiling-eyes", name: "Warm Smile", file: "/stickers/noto/smiling-eyes.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "😊", description: "Smiling tenderly" },
  { id: "noto-blushing-sun", name: "Blushing Sun", file: "/stickers/noto/blushing-sun.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "☀️", description: "Warm glowing sun" },
  { id: "noto-blooming-rose", name: "Sweet Rose", file: "/stickers/noto/blooming-rose.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🌹", description: "Red rose blooming" },
  { id: "noto-bunny-hop", name: "Bunny Hop", file: "/stickers/noto/bunny-hop.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🐰", description: "Happy hopping bunny" },
  { id: "noto-cupcake", name: "Sweet Cupcake", file: "/stickers/noto/cupcake.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🧁", description: "Cute little cupcake" },
  { id: "noto-sparkles", name: "Sparkles", file: "/stickers/noto/sparkles.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "✨", description: "Magic sparkles" },
  { id: "noto-warm-hug", name: "Bear & Bunny", file: "/stickers/noto/warm-hug.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🫂", description: "People hugging" },
  { id: "noto-star-eyes", name: "Star Eyes", file: "/stickers/noto/star-eyes.svg", mood: "silly", isAnimated: true, category: "cute", emoji: "🤩", description: "Starstruck and amazed" },
  { id: "noto-melting-face", name: "Melting For You", file: "/stickers/noto/melting-face.svg", mood: "sweet", isAnimated: true, category: "cute", emoji: "🫠", description: "Melting with warmth" },
];

// 12 Caption Phrase Stickers
export const CAPTION_STICKER_ENTRIES: readonly StickerEntry[] = [
  { id: "caption-come-talk", name: "come talk to me", file: "/stickers/captions/caption-come-talk.svg", mood: "missyou", isAnimated: false, category: "captions", emoji: "💬", caption: "come talk to me" },
  { id: "caption-miss-you", name: "miss you", file: "/stickers/captions/caption-miss-you.svg", mood: "missyou", isAnimated: false, category: "captions", emoji: "🥺", caption: "miss you" },
  { id: "caption-drink-tea", name: "drink your tea", file: "/stickers/captions/caption-drink-tea.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "🍵", caption: "drink your tea" },
  { id: "caption-proud-of-you", name: "proud of you", file: "/stickers/captions/caption-proud-of-you.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "🌟", caption: "proud of you" },
  { id: "caption-call-me", name: "call me when you're free", file: "/stickers/captions/caption-call-me.svg", mood: "missyou", isAnimated: false, category: "captions", emoji: "📞", caption: "call me when you're free" },
  { id: "caption-good-morning", name: "good morning sweetheart", file: "/stickers/captions/caption-good-morning.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "☀️", caption: "good morning sweetheart" },
  { id: "caption-sweet-dreams", name: "sweet dreams", file: "/stickers/captions/caption-sweet-dreams.svg", mood: "goodnight", isAnimated: false, category: "captions", emoji: "🌙", caption: "sweet dreams" },
  { id: "caption-you-got-this", name: "you got this", file: "/stickers/captions/caption-you-got-this.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "💪", caption: "you got this" },
  { id: "caption-on-my-way", name: "on my way", file: "/stickers/captions/caption-on-my-way.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "🏃‍♀️", caption: "on my way" },
  { id: "caption-thinking-of-you", name: "thinking of you", file: "/stickers/captions/caption-thinking-of-you.svg", mood: "missyou", isAnimated: false, category: "captions", emoji: "💭", caption: "thinking of you" },
  { id: "caption-hug-me", name: "hug me", file: "/stickers/captions/caption-hug-me.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "🫂", caption: "hug me" },
  { id: "caption-mine", name: "mine", file: "/stickers/captions/caption-mine.svg", mood: "sweet", isAnimated: false, category: "captions", emoji: "🔐", caption: "mine" },
];

// 40 Legacy Tea Pack Stickers
export const TEA_STICKER_ENTRIES: readonly StickerEntry[] = [
  { id: "sweet-01", name: "Bear Hug", file: "/stickers/sweet-01.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "🧸" },
  { id: "sweet-02", name: "Flower for You", file: "/stickers/sweet-02.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "🌹" },
  { id: "sweet-03", name: "Blowing Kisses", file: "/stickers/sweet-03.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "😘" },
  { id: "sweet-04", name: "Holding Paws", file: "/stickers/sweet-04.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "🐾" },
  { id: "sweet-05", name: "Honey Share", file: "/stickers/sweet-05.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "🍯" },
  { id: "sweet-06", name: "Shoulder Ride", file: "/stickers/sweet-06.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "🐻" },
  { id: "sweet-07", name: "Cozy Scarf", file: "/stickers/sweet-07.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "🧣" },
  { id: "sweet-08", name: "Eskimo Kiss", file: "/stickers/sweet-08.svg", mood: "sweet", isAnimated: false, category: "tea", emoji: "✨" },

  { id: "silly-01", name: "Tongue Out", file: "/stickers/silly-01.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "😜" },
  { id: "silly-02", name: "Pot on Head", file: "/stickers/silly-02.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "🍯" },
  { id: "silly-03", name: "Wiggle Dance", file: "/stickers/silly-03.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "💃" },
  { id: "silly-04", name: "Cool Shades", file: "/stickers/silly-04.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "😎" },
  { id: "silly-05", name: "Tickle Monster", file: "/stickers/silly-05.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "😆" },
  { id: "silly-06", name: "Apple Balance", file: "/stickers/silly-06.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "🍎" },
  { id: "silly-07", name: "Box Pop", file: "/stickers/silly-07.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "📦" },
  { id: "silly-08", name: "Secret Handshake", file: "/stickers/silly-08.svg", mood: "silly", isAnimated: false, category: "tea", emoji: "🤝" },

  { id: "sorry-01", name: "Puppy Eyes", file: "/stickers/sorry-01.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "🥺" },
  { id: "sorry-02", name: "Band-aid Heart", file: "/stickers/sorry-02.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "🩹" },
  { id: "sorry-03", name: "Hiding Face", file: "/stickers/sorry-03.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "🙈" },
  { id: "sorry-04", name: "Single Daisy", file: "/stickers/sorry-04.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "🌼" },
  { id: "sorry-05", name: "Pinky Promise", file: "/stickers/sorry-05.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "🤙" },
  { id: "sorry-06", name: "Gentle Pat", file: "/stickers/sorry-06.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "💆" },
  { id: "sorry-07", name: "Rain Umbrella", file: "/stickers/sorry-07.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "☔" },
  { id: "sorry-08", name: "Forehead Nuzzle", file: "/stickers/sorry-08.svg", mood: "sorry", isAnimated: false, category: "tea", emoji: "💕" },

  { id: "missyou-01", name: "Photo Frame", file: "/stickers/missyou-01.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "🖼️" },
  { id: "missyou-02", name: "Cup Telephone", file: "/stickers/missyou-02.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "🥤" },
  { id: "missyou-03", name: "Pillow Hug", file: "/stickers/missyou-03.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "🛌" },
  { id: "missyou-04", name: "Window Rain", file: "/stickers/missyou-04.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "🌧️" },
  { id: "missyou-05", name: "Counting Days", file: "/stickers/missyou-05.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "📅" },
  { id: "missyou-06", name: "Paper Plane", file: "/stickers/missyou-06.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "✈️" },
  { id: "missyou-07", name: "Same Star", file: "/stickers/missyou-07.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "⭐" },
  { id: "missyou-08", name: "Dreaming Sigh", file: "/stickers/missyou-08.svg", mood: "missyou", isAnimated: false, category: "tea", emoji: "💭" },

  { id: "goodnight-01", name: "Tucked In", file: "/stickers/goodnight-01.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "🛌" },
  { id: "goodnight-02", name: "Forehead Kiss", file: "/stickers/goodnight-02.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "😘" },
  { id: "goodnight-03", name: "Moon Hug", file: "/stickers/goodnight-03.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "🌙" },
  { id: "goodnight-04", name: "Cloud Snooze", file: "/stickers/goodnight-04.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "☁️" },
  { id: "goodnight-05", name: "Firefly Lantern", file: "/stickers/goodnight-05.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "🏮" },
  { id: "goodnight-06", name: "Pyjama Yawn", file: "/stickers/goodnight-06.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "🥱" },
  { id: "goodnight-07", name: "Counting Sheep", file: "/stickers/goodnight-07.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "🐑" },
  { id: "goodnight-08", name: "Sweet Dreams", file: "/stickers/goodnight-08.svg", mood: "goodnight", isAnimated: false, category: "tea", emoji: "✨" },
];

export const ALL_STICKER_ENTRIES: readonly StickerEntry[] = [
  ...NOTO_STICKER_ENTRIES,
  ...CAPTION_STICKER_ENTRIES,
  ...TEA_STICKER_ENTRIES,
];

// Lookup maps
export const STICKER_BY_ID = new Map<string, StickerEntry>(
  ALL_STICKER_ENTRIES.map((s) => [s.id, s])
);

// Map of all legacy or alternate file paths/IDs to canonical entries
export const LEGACY_ALIASES: Record<string, string> = {
  // Direct file aliases
  "/stickers/noto-bear.svg": "noto-bear",
  "/stickers/noto-sparkling-heart.svg": "noto-sparkling-heart",
  "/stickers/noto-blowing-kiss.svg": "noto-blowing-kiss",
  "/stickers/noto-hug.svg": "noto-hug",
  "/stickers/noto-pleading-face.svg": "noto-pleading-face",
  "/stickers/noto-party-face.svg": "noto-party-face",
  "/stickers/noto-tea-cup.svg": "noto-tea-cup",
  "/stickers/noto-cat-heart-eyes.svg": "noto-cat-heart-eyes",
  "/stickers/noto-blushing-cat.svg": "noto-blushing-cat",
  "/stickers/noto-cute-monkey.svg": "noto-cute-monkey",
  "/stickers/noto-fire-heart.svg": "noto-fire-heart",
  "/stickers/noto-butterfly.svg": "noto-butterfly",
  "/stickers/noto-love-letter.svg": "noto-love-letter",
  "/stickers/noto-holding-hands.svg": "noto-holding-hands",
  "/stickers/noto-sleeping-face.svg": "noto-sleeping-face",
  "/stickers/noto-smiling-eyes.svg": "noto-smiling-eyes",
  "/stickers/noto-blushing-sun.svg": "noto-blushing-sun",
  "/stickers/noto-blooming-rose.svg": "noto-blooming-rose",
  "/stickers/noto-bunny-hop.svg": "noto-bunny-hop",
  "/stickers/noto-cupcake.svg": "noto-cupcake",
  "/stickers/noto-sparkles.svg": "noto-sparkles",
  "/stickers/noto-warm-hug.svg": "noto-warm-hug",
  "/stickers/noto-star-eyes.svg": "noto-star-eyes",
  "/stickers/noto-melting-face.svg": "noto-melting-face",

  // Caption paths without subfolder
  "/stickers/caption-come-talk.svg": "caption-come-talk",
  "/stickers/caption-miss-you.svg": "caption-miss-you",
  "/stickers/caption-drink-tea.svg": "caption-drink-tea",
  "/stickers/caption-proud-of-you.svg": "caption-proud-of-you",
  "/stickers/caption-call-me.svg": "caption-call-me",
  "/stickers/caption-good-morning.svg": "caption-good-morning",
  "/stickers/caption-sweet-dreams.svg": "caption-sweet-dreams",
  "/stickers/caption-you-got-this.svg": "caption-you-got-this",
  "/stickers/caption-on-my-way.svg": "caption-on-my-way",
  "/stickers/caption-thinking-of-you.svg": "caption-thinking-of-you",
  "/stickers/caption-hug-me.svg": "caption-hug-me",
  "/stickers/caption-mine.svg": "caption-mine",
};

// Also auto-populate sub-name aliases (e.g. "bear" -> "noto-bear")
NOTO_STICKER_ENTRIES.forEach((entry) => {
  const shortName = entry.id.replace(/^noto-/, "");
  LEGACY_ALIASES[shortName] = entry.id;
  LEGACY_ALIASES[`/stickers/${shortName}.svg`] = entry.id;
  LEGACY_ALIASES[`/stickers/noto/${shortName}.svg`] = entry.id;
});
