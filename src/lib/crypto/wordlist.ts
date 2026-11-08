/**
 * Curated list of friendly, distinct, memorable words for 4-word passphrases.
 */
export const WORDLIST: readonly string[] = [
  "acorn", "amber", "anchor", "angel", "apple", "apron", "archer", "arrow", "autumn", "badge",
  "baker", "bamboo", "banner", "basket", "beacon", "beaver", "beetle", "berry", "biscuit", "blanket",
  "blossom", "bonfire", "breeze", "bridge", "bubble", "butter", "cabin", "cactus", "candle", "canvas",
  "canyon", "castle", "cedar", "cherry", "circus", "clover", "cobalt", "coffee", "cookie", "copper",
  "coral", "cotton", "cricket", "crystal", "cuddle", "daisy", "dawn", "dolphin", "dragon", "drift",
  "eagle", "ember", "falcon", "feather", "ferret", "fawn", "fiddle", "flame", "forest", "fountain",
  "galaxy", "garden", "ginger", "glider", "glow", "granite", "grape", "harbor", "haven", "hazel",
  "heather", "honey", "horizon", "humming", "icicle", "island", "jacket", "jasmine", "jelly", "journey",
  "kitten", "lagoon", "lantern", "lavender", "lemon", "lilac", "lily", "lizard", "lotus", "locket",
  "maple", "meadow", "melody", "melon", "mint", "mirror", "monkey", "moon", "morning", "moss",
  "muffin", "nectar", "nestle", "noodle", "nutmeg", "oasis", "ocean", "olive", "orchid", "otter",
  "paddle", "palace", "panda", "papaya", "parrot", "pastel", "peanut", "pebble", "pepper", "petal",
  "pigeon", "pillow", "planet", "pocket", "poplar", "puppy", "quartz", "quilt", "rabbit", "rainbow",
  "raindrop", "ribbon", "ripple", "robin", "rocket", "rosebud", "saffron", "sailor", "sapphire", "shadow",
  "shimmer", "silver", "skylark", "snowflake", "sparrow", "spring", "starlet", "sunset", "teapot", "thistle",
  "tiger", "timber", "tulip", "turtle", "velvet", "violet", "walnut", "wander", "willow", "winter",
  "wizard", "woodland", "yarrow", "zenith", "zephyr"
];

/**
 * Generate a cryptographically secure 4-word random passphrase.
 */
export function generateSuggestedPassphrase(wordCount = 4): string {
  const words: string[] = [];
  const array = new Uint32Array(wordCount);
  crypto.getRandomValues(array);

  for (let i = 0; i < wordCount; i++) {
    const index = array[i] % WORDLIST.length;
    words.push(WORDLIST[index]);
  }

  return words.join("-");
}

/**
 * Validate that a passphrase meets minimum entropy requirements.
 */
export function validatePassphrase(passphrase: string): { valid: boolean; error?: string } {
  const trimmed = passphrase.trim().toLowerCase();
  const words = trimmed.split(/[\s\-_]+/).filter(Boolean);

  if (words.length < 4) {
    return { valid: false, error: "Passphrase must contain at least 4 words" };
  }
  if (trimmed.length < 16) {
    return { valid: false, error: "Passphrase must be at least 16 characters long" };
  }

  return { valid: true };
}
