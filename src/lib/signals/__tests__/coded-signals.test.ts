import { describe, it, expect } from "vitest";
import { APP_CONFIG } from "@/config/app.config";
import { isWithinQuietHours } from "@/lib/server/push";
import { db } from "@/lib/server/db";
import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";
import { PlaintextMessagePayload } from "@/lib/chat/types";

describe("Phase 6: Coded Signals, Push & Quiet Hours", () => {
  const mockEncKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) mockEncKey[i] = i + 5;

  describe("Coded Signal Definitions & Decoy Texts", () => {
    it("has exactly 6 coded signal slots (0 to 5) with neutral planner decoy texts", () => {
      expect(APP_CONFIG.codedSignals).toHaveLength(6);

      APP_CONFIG.codedSignals.forEach((sig, idx) => {
        expect(sig.index).toBe(idx);
        expect(sig.decoyTitle).toBe(APP_CONFIG.decoyName);
        expect(sig.decoyBody).toMatch(/^Planner:/);
        expect(sig.defaultSecretLabel.length).toBeGreaterThan(0);
        // Decoy body must NOT mention room or secret terms
        expect(sig.decoyBody.toLowerCase()).not.toContain("love");
        expect(sig.decoyBody.toLowerCase()).not.toContain("secret");
        expect(sig.decoyBody.toLowerCase()).not.toContain("chat");
      });
    });
  });

  describe("Quiet Hours Window Calculations", () => {
    it("accurately handles daytime quiet hours", () => {
      // 14:30 is inside 13:00-16:00
      const d1 = new Date("2026-05-10T14:30:00");
      expect(isWithinQuietHours("13:00", "16:00", d1)).toBe(true);

      // 17:00 is outside 13:00-16:00
      const d2 = new Date("2026-05-10T17:00:00");
      expect(isWithinQuietHours("13:00", "16:00", d2)).toBe(false);
    });

    it("accurately handles overnight quiet hours spanning midnight", () => {
      // 23:45 is inside 23:00-07:00
      const dLate = new Date("2026-05-10T23:45:00");
      expect(isWithinQuietHours("23:00", "07:00", dLate)).toBe(true);

      // 03:15 is inside 23:00-07:00
      const dEarly = new Date("2026-05-10T03:15:00");
      expect(isWithinQuietHours("23:00", "07:00", dEarly)).toBe(true);

      // 14:00 is outside 23:00-07:00
      const dNoon = new Date("2026-05-10T14:00:00");
      expect(isWithinQuietHours("23:00", "07:00", dNoon)).toBe(false);
    });

    it("returns false for empty or invalid quiet hours input", () => {
      expect(isWithinQuietHours("", "")).toBe(false);
      expect(isWithinQuietHours("invalid", "times")).toBe(false);
    });
  });

  describe("Push Subscription Management & Partner Isolation", () => {
    it("stores and retrieves push subscriptions exclusively for the partner device", async () => {
      const roomId = `room-push-test-${Date.now()}`;
      await db.createRoom(roomId, "dummy-verifier");

      // Device 1 (Sender)
      await db.createDevice("dev-sender", roomId, "pubkey-1", true);
      // Device 2 (Partner)
      await db.createDevice("dev-partner", roomId, "pubkey-2", true);

      const mockSub = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-token",
        keys: { p256dh: "key123", auth: "auth123" },
      };

      await db.savePushSubscription("dev-partner", mockSub);

      const partnerSubs = await db.getPartnerPushSubscriptions(roomId, "dev-sender");
      expect(partnerSubs).toHaveLength(1);
      expect(partnerSubs[0].deviceId).toBe("dev-partner");
      expect(partnerSubs[0].subscription).toEqual(mockSub);

      // Sender querying for own subscriptions returns empty
      const senderSubs = await db.getPartnerPushSubscriptions(roomId, "dev-partner");
      expect(senderSubs).toHaveLength(0);

      // Unsubscribe / removal
      await db.removePushSubscription("dev-partner");
      const afterRemoval = await db.getPartnerPushSubscriptions(roomId, "dev-sender");
      expect(afterRemoval).toHaveLength(0);
    });
  });

  describe("Coded Signal E2EE Message Ingestion", () => {
    it("encrypts and decrypts signal payload containing custom secret meaning", async () => {
      const secretMeaning = "Free in 10 minutes, call me!";
      const payload: PlaintextMessagePayload = {
        text: secretMeaning,
        extra: { signalIndex: 5 },
        seenBy: { "dev-sender": Date.now() },
      };

      const encrypted = await encryptPayload(payload, mockEncKey);
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.ciphertext).not.toContain("Free in 10 minutes");

      const decrypted = await decryptPayload<PlaintextMessagePayload>(encrypted, mockEncKey);
      expect(decrypted.text).toBe(secretMeaning);
      expect(decrypted.extra?.signalIndex).toBe(5);
    });
  });
});
