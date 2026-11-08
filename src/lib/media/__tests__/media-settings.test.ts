import { describe, it, expect, beforeEach } from "vitest";
import { encryptMediaBlob, decryptMediaBlob } from "@/lib/media/photo-crypto";
import {
  calculateDaysTogether,
  getExpiryTimestamp,
  DEFAULT_ROOM_SETTINGS,
  RoomSettings,
} from "@/lib/settings/room-settings";
import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";
import { db } from "@/lib/server/db";

describe("Phase 5: Media, Disappearing Messages & Room Settings", () => {
  const mockEncKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) mockEncKey[i] = i + 1;

  describe("Photo Binary Encryption & Decryption", () => {
    it("successfully encrypts and decrypts raw binary photo data with AES-256-GCM", async () => {
      // Simulate raw JPEG bytes
      const testBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
      const blob = new Blob([testBytes], { type: "image/jpeg" });

      const { encryptedBlob, ivBase64 } = await encryptMediaBlob(blob, mockEncKey);
      expect(encryptedBlob).toBeDefined();
      expect(encryptedBlob.size).toBeGreaterThan(0);
      expect(typeof ivBase64).toBe("string");

      const decryptedBlob = await decryptMediaBlob(
        encryptedBlob,
        ivBase64,
        mockEncKey,
        "image/jpeg"
      );

      const decryptedBytes = new Uint8Array(await decryptedBlob.arrayBuffer());
      expect(decryptedBytes).toEqual(testBytes);
    });

    it("fails decryption if an incorrect encryption key is provided", async () => {
      const testBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const blob = new Blob([testBytes]);

      const { encryptedBlob, ivBase64 } = await encryptMediaBlob(blob, mockEncKey);

      const wrongKey = new Uint8Array(32);
      wrongKey.fill(99);

      await expect(
        decryptMediaBlob(encryptedBlob, ivBase64, wrongKey, "image/jpeg")
      ).rejects.toThrow();
    });
  });

  describe("Disappearing Message Calculations & Filtering", () => {
    it("returns null expiry for 'off'", () => {
      expect(getExpiryTimestamp("off")).toBeNull();
    });

    it("calculates future timestamp for 1h, 1d, and 1w timers", () => {
      const now = Date.now();
      const exp1h = getExpiryTimestamp("1h");
      const exp1d = getExpiryTimestamp("1d");
      const exp1w = getExpiryTimestamp("1w");

      expect(exp1h).not.toBeNull();
      expect(new Date(exp1h!).getTime()).toBeGreaterThan(now);
      expect(new Date(exp1h!).getTime() - now).toBeGreaterThanOrEqual(3500 * 1000);

      expect(exp1d).not.toBeNull();
      expect(new Date(exp1d!).getTime() - now).toBeGreaterThanOrEqual(23 * 3600 * 1000);

      expect(exp1w).not.toBeNull();
      expect(new Date(exp1w!).getTime() - now).toBeGreaterThanOrEqual(6 * 86400 * 1000);
    });

    it("filters out expired messages from database query", async () => {
      const testRoomId = `test-room-expiry-${Date.now()}`;
      await db.createRoom(testRoomId, "dummy-verifier");

      // Insert active message
      await db.insertMessage({
        id: "msg-active",
        room_id: testRoomId,
        sender_device_id: "dev-1",
        ciphertext: "ct1",
        iv: "iv1",
        type: "text",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60000).toISOString(),
      });

      // Insert already expired message
      await db.insertMessage({
        id: "msg-expired",
        room_id: testRoomId,
        sender_device_id: "dev-1",
        ciphertext: "ct2",
        iv: "iv2",
        type: "text",
        created_at: new Date(Date.now() - 10000).toISOString(),
        expires_at: new Date(Date.now() - 5000).toISOString(),
      });

      const messages = await db.getMessages(testRoomId);
      const ids = messages.map((m) => m.id);

      expect(ids).toContain("msg-active");
      expect(ids).not.toContain("msg-expired");
    });

    it("cleans up expired messages and deletes them from store", async () => {
      const testRoomId = `test-room-cleanup-${Date.now()}`;
      await db.createRoom(testRoomId, "dummy-verifier");

      await db.insertMessage({
        id: "msg-to-clean",
        room_id: testRoomId,
        sender_device_id: "dev-1",
        ciphertext: "ct3",
        iv: "iv3",
        type: "text",
        created_at: new Date(Date.now() - 10000).toISOString(),
        expires_at: new Date(Date.now() - 1000).toISOString(),
      });

      const cleanupResult = await db.cleanupExpiredMessages(testRoomId);
      expect(cleanupResult.deletedMessages).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Day Counter Calculations", () => {
    it("returns null when no start date is set", () => {
      expect(calculateDaysTogether("")).toBeNull();
    });

    it("calculates accurate day counter for past anniversary date", () => {
      // 10 days ago
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const days = calculateDaysTogether(tenDaysAgo);
      expect(days).toBeGreaterThanOrEqual(10);
      expect(days).toBeLessThanOrEqual(12);
    });

    it("handles today as day 1", () => {
      const today = new Date().toISOString().split("T")[0];
      const days = calculateDaysTogether(today);
      expect(days).toBe(1);
    });
  });

  describe("Room Settings Encrypted Storage", () => {
    it("encrypts and decrypts full room settings object without data loss", async () => {
      const settings: RoomSettings = {
        ...DEFAULT_ROOM_SETTINGS,
        myNickname: "Honey Bear",
        partnerNickname: "Sweet Pea",
        togetherSince: "2023-11-15",
        disappearingTimer: "1d",
        backgroundTheme: "honey-amber",
        partnerPronoun: "he",
      };

      const encrypted = await encryptPayload(settings, mockEncKey);
      expect(encrypted.ciphertext).toBeDefined();

      const decrypted = await decryptPayload<RoomSettings>(encrypted, mockEncKey);
      expect(decrypted.myNickname).toBe("Honey Bear");
      expect(decrypted.partnerNickname).toBe("Sweet Pea");
      expect(decrypted.togetherSince).toBe("2023-11-15");
      expect(decrypted.disappearingTimer).toBe("1d");
      expect(decrypted.backgroundTheme).toBe("honey-amber");
      expect(decrypted.partnerPronoun).toBe("he");
    });
  });

  describe("Media Blob Storage in DB", () => {
    it("uploads, retrieves, and deletes encrypted media blobs", async () => {
      const roomId = `room-storage-${Date.now()}`;
      const fileId = "test-file-123";
      const data = Buffer.from("encrypted-photo-content-sample");

      const path = await db.uploadMediaBlob(roomId, fileId, data, "image/jpeg");
      expect(path).toBe(`${roomId}/${fileId}.enc`);

      const fetched = await db.getMediaBlob(roomId, fileId);
      expect(fetched).not.toBeNull();
      expect(Buffer.from(fetched!.data).toString()).toBe("encrypted-photo-content-sample");

      const deleted = await db.deleteMediaBlob(roomId, fileId);
      expect(deleted).toBe(true);

      const afterDelete = await db.getMediaBlob(roomId, fileId);
      expect(afterDelete).toBeNull();
    });
  });
});
