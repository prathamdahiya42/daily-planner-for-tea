import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicStickersDir = path.join(rootDir, "public", "stickers");

const isCheckOnly = process.argv.includes("--check");

// Define expected files
const EXPECTED_NOTO = [
  "bear.svg", "sparkling-heart.svg", "blowing-kiss.svg", "hug.svg", "pleading-face.svg",
  "party-face.svg", "tea-cup.svg", "cat-heart-eyes.svg", "blushing-cat.svg", "cute-monkey.svg",
  "fire-heart.svg", "butterfly.svg", "love-letter.svg", "holding-hands.svg", "sleeping-face.svg",
  "smiling-eyes.svg", "blushing-sun.svg", "blooming-rose.svg", "bunny-hop.svg", "cupcake.svg",
  "sparkles.svg", "warm-hug.svg", "star-eyes.svg", "melting-face.svg"
];

const EXPECTED_CAPTIONS = [
  "caption-come-talk.svg", "caption-miss-you.svg", "caption-drink-tea.svg", "caption-proud-of-you.svg",
  "caption-call-me.svg", "caption-good-morning.svg", "caption-sweet-dreams.svg", "caption-you-got-this.svg",
  "caption-on-my-way.svg", "caption-thinking-of-you.svg", "caption-hug-me.svg", "caption-mine.svg"
];

const MOODS = ["sweet", "silly", "sorry", "missyou", "goodnight"];
const EXPECTED_TEA = [];
for (const mood of MOODS) {
  for (let i = 1; i <= 8; i++) {
    EXPECTED_TEA.push(`${mood}-0${i}.svg`);
  }
}

let missingCount = 0;
let validCount = 0;

function verifyFile(fullPath, label) {
  if (!fs.existsSync(fullPath)) {
    console.error(`[STK-ERR] Missing ${label}: ${fullPath}`);
    missingCount++;
    return false;
  }
  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    console.error(`[STK-ERR] Zero-byte ${label}: ${fullPath}`);
    missingCount++;
    return false;
  }
  const content = fs.readFileSync(fullPath, "utf8");
  if (!content.includes("<svg")) {
    console.error(`[STK-ERR] Invalid SVG content for ${label}: ${fullPath}`);
    missingCount++;
    return false;
  }
  validCount++;
  return true;
}

// 1. Verify Noto stickers
for (const file of EXPECTED_NOTO) {
  const p = path.join(publicStickersDir, "noto", file);
  verifyFile(p, `Noto sticker (${file})`);
}

// 2. Verify Captions
for (const file of EXPECTED_CAPTIONS) {
  const p = path.join(publicStickersDir, "captions", file);
  verifyFile(p, `Caption sticker (${file})`);
}

// 3. Verify Tea pack
for (const file of EXPECTED_TEA) {
  const p = path.join(publicStickersDir, file);
  verifyFile(p, `Tea sticker (${file})`);
}

console.log(`[Stickers Check] Total verified: ${validCount}, Missing/Invalid: ${missingCount}`);

if (missingCount > 0) {
  if (isCheckOnly) {
    console.error(`[FAIL] ${missingCount} sticker assets are missing or invalid.`);
    process.exit(1);
  } else {
    console.warn(`[WARN] Missing stickers detected. Please ensure all assets are in public/stickers.`);
    process.exit(1);
  }
} else {
  console.log(`[SUCCESS] All ${validCount} sticker assets verified and valid.`);
  process.exit(0);
}
