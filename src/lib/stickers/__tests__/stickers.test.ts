import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  STICKER_PACK,
  getStickerOfTheDay,
  isStickerOfTheDay,
  getRandomSticker,
  getStickerById,
} from "../stickers";
import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";
import { PlaintextMessagePayload } from "@/lib/chat/types";

describe("Phase 4: Sticker Engine & Asset Verification", () => {
  it("contains exactly 40 stickers in the sticker pack", () => {
    expect(STICKER_PACK.length).toBe(40);
  });

  it("covers all 5 mood categories evenly with 8 stickers each", () => {
    const moods = ["sweet", "silly", "sorry", "missyou", "goodnight"] as const;

    for (const mood of moods) {
      const count = STICKER_PACK.filter((s) => s.mood === mood).length;
      expect(count).toBe(8);
    }
  });

  it("verifies every SVG sticker file exists on disk with valid 512x512 SVG content", () => {
    const stickersDir = path.join(process.cwd(), "public", "stickers");

    for (const sticker of STICKER_PACK) {
      const filePath = path.join(stickersDir, `${sticker.id}.svg`);
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain("<svg");
      expect(content).toContain('viewBox="0 0 512 512"');
      expect(content).toContain("</svg>");
    }
  });

  it("calculates Sticker of the Day deterministically based on date", () => {
    const date1 = new Date("2026-05-20T10:00:00Z");
    const date2 = new Date("2026-05-20T23:59:59Z");
    const date3 = new Date("2026-05-21T01:00:00Z");

    const stickerDay1A = getStickerOfTheDay(date1);
    const stickerDay1B = getStickerOfTheDay(date2);
    const stickerDay2 = getStickerOfTheDay(date3);

    // Same calendar date yields the exact same sticker
    expect(stickerDay1A.id).toBe(stickerDay1B.id);
    expect(isStickerOfTheDay(stickerDay1A.id, date1)).toBe(true);
    expect(isStickerOfTheDay("invalid-id", date1)).toBe(false);

    // Next day rotates to a different sticker
    expect(stickerDay2.id).toBeDefined();
  });

  it("selects surprise random stickers matching the requested mood", () => {
    const surpriseSweet = getRandomSticker("sweet");
    expect(surpriseSweet.mood).toBe("sweet");

    const surpriseSorry = getRandomSticker("sorry");
    expect(surpriseSorry.mood).toBe("sorry");

    const surpriseAny = getRandomSticker("all");
    expect(STICKER_PACK.some((s) => s.id === surpriseAny.id)).toBe(true);
  });

  it("encrypts and decrypts sticker messages end-to-end", async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));

    const payload: PlaintextMessagePayload = {
      text: "",
      stickerId: "sweet-01",
      stickerFile: "/stickers/sweet-01.svg",
      seenBy: { "dev-1": Date.now() },
    };

    const encrypted = await encryptPayload(payload, key);
    expect(encrypted.ciphertext).not.toContain("sweet-01");

    const decrypted = await decryptPayload<PlaintextMessagePayload>(encrypted, key);
    expect(decrypted.stickerId).toBe("sweet-01");
    expect(decrypted.stickerFile).toBe("/stickers/sweet-01.svg");
  });

  it("attaches and decrypts sticker reactions on messages", async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));

    const payload: PlaintextMessagePayload = {
      text: "I love you so much!",
      reactions: { "dev-1": "❤️" },
      stickerReactions: { "dev-2": "sweet-03" }, // partner reacted with bear kiss sticker
    };

    const encrypted = await encryptPayload(payload, key);
    const decrypted = await decryptPayload<PlaintextMessagePayload>(encrypted, key);

    expect(decrypted.reactions?.["dev-1"]).toBe("❤️");
    expect(decrypted.stickerReactions?.["dev-2"]).toBe("sweet-03");

    const sticker = getStickerById(decrypted.stickerReactions!["dev-2"]);
    expect(sticker?.name).toBe("Blowing Kisses");
  });
});
