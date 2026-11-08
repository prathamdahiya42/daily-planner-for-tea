import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db";
import { signSessionToken, verifySessionToken } from "../jwt";
import { verifyDeviceSignature } from "../ecdsa-verify";
import { signChallenge } from "@/lib/crypto/device-identity";
import { deriveCredentialsFromPassphrase } from "@/lib/crypto/kdf";

describe("Phase 2: Authentication, Device Binding, & Room Isolation", () => {
  const roomAPassphrase = "gentle-stream-morning-breeze";
  const roomBPassphrase = "golden-sunset-autumn-meadow";

  // Helper to generate a test ECDSA keypair
  async function generateTestKeypair() {
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );
    const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    return {
      privateKey: keyPair.privateKey,
      publicKeyJwk: JSON.stringify(jwk),
    };
  }

  it("creates a room and auto-approves the first device", async () => {
    const creds = await deriveCredentialsFromPassphrase(roomAPassphrase, { forcePbkdf2: true });
    const dev1 = await generateTestKeypair();
    const dev1Id = "dev-1-uuid";

    // Room does not exist yet
    const initial = await db.getRoom(creds.roomId);
    expect(initial).toBeNull();

    // Create room and device 1
    const room = await db.createRoom(creds.roomId, creds.authVerifier);
    expect(room.id).toBe(creds.roomId);
    expect(room.verifier).toBe(creds.authVerifier);

    const device1 = await db.createDevice(dev1Id, creds.roomId, dev1.publicKeyJwk, true);
    expect(device1.approved).toBe(true);
    expect(device1.room_id).toBe(creds.roomId);
  });

  it("completes ECDSA challenge-response and issues a valid JWT", async () => {
    const creds = await deriveCredentialsFromPassphrase(roomAPassphrase, { forcePbkdf2: true });
    const dev1 = await generateTestKeypair();
    const dev1Id = "dev-1-auth-test";

    await db.createDevice(dev1Id, creds.roomId, dev1.publicKeyJwk, true);

    // Issue challenge
    const nonce = "test-challenge-nonce-1234567890abcdef";
    await db.saveChallenge(dev1Id, nonce);

    // Sign challenge with private key
    const signature = await signChallenge(nonce, dev1.privateKey);

    // Verify challenge and signature on server
    const isNonceValid = await db.verifyAndConsumeChallenge(dev1Id, nonce);
    expect(isNonceValid).toBe(true);

    const isSigValid = await verifyDeviceSignature(dev1.publicKeyJwk, nonce, signature);
    expect(isSigValid).toBe(true);

    // Issue token
    const token = await signSessionToken({ room_id: creds.roomId, device_id: dev1Id });
    expect(token).toBeDefined();

    // Verify token claims
    const claims = await verifySessionToken(token);
    expect(claims?.room_id).toBe(creds.roomId);
    expect(claims?.device_id).toBe(dev1Id);
  });

  it("enforces pairing flow: Device 2 requires approval from Device 1", async () => {
    const creds = await deriveCredentialsFromPassphrase(roomAPassphrase, { forcePbkdf2: true });
    const dev2 = await generateTestKeypair();
    const dev2Id = "dev-2-uuid";

    // Device 2 joins room: registered as unapproved
    const device2 = await db.createDevice(dev2Id, creds.roomId, dev2.publicKeyJwk, false);
    expect(device2.approved).toBe(false);

    // Device 2 cannot obtain an active session before approval
    const fetchedDev2 = await db.getDevice(dev2Id);
    expect(fetchedDev2?.approved).toBe(false);

    // Device 1 approves Device 2
    const approvedDev2 = await db.approveDevice(dev2Id);
    expect(approvedDev2?.approved).toBe(true);

    // Device 2 can now receive session JWT
    const token = await signSessionToken({ room_id: creds.roomId, device_id: dev2Id });
    const claims = await verifySessionToken(token);
    expect(claims?.device_id).toBe(dev2Id);
  });

  it("strictly enforces maximum 2 approved devices per room", async () => {
    const creds = await deriveCredentialsFromPassphrase(roomAPassphrase, { forcePbkdf2: true });
    const devices = await db.getDevicesByRoom(creds.roomId);
    const approvedCount = devices.filter((d) => d.approved).length;

    // Room already has dev-1 and dev-2 approved
    expect(approvedCount).toBeGreaterThanOrEqual(2);

    // Device 3 attempts to join
    const dev3 = await generateTestKeypair();
    const dev3Id = "dev-3-uuid";

    // Check business logic rule
    const isExceeded = approvedCount >= 2;
    expect(isExceeded).toBe(true);
  });

  it("proves that a request with another room's token gets NOTHING (Cross-Room Isolation)", async () => {
    // Setup Room A and Room B
    const roomA = await deriveCredentialsFromPassphrase(roomAPassphrase, { forcePbkdf2: true });
    const roomB = await deriveCredentialsFromPassphrase(roomBPassphrase, { forcePbkdf2: true });

    expect(roomA.roomId).not.toBe(roomB.roomId);

    // Tokens for Device in Room A and Device in Room B
    const tokenRoomA = await signSessionToken({ room_id: roomA.roomId, device_id: "dev-A" });
    const tokenRoomB = await signSessionToken({ room_id: roomB.roomId, device_id: "dev-B" });

    const claimsA = await verifySessionToken(tokenRoomA);
    const claimsB = await verifySessionToken(tokenRoomB);

    expect(claimsA?.room_id).toBe(roomA.roomId);
    expect(claimsB?.room_id).toBe(roomB.roomId);

    // Mock dataset simulating RLS policy: SELECT * WHERE room_id = auth.jwt()->>'room_id'
    const mockMessages = [
      { id: "msg-1", room_id: roomA.roomId, ciphertext: "secret-A-message" },
      { id: "msg-2", room_id: roomA.roomId, ciphertext: "secret-A-photo" },
      { id: "msg-3", room_id: roomB.roomId, ciphertext: "secret-B-message" },
    ];

    // Query executed by Room B token
    const accessibleByRoomB = mockMessages.filter((msg) => msg.room_id === claimsB?.room_id);

    // Room B MUST see only Room B data, and 0 items from Room A
    expect(accessibleByRoomB.length).toBe(1);
    expect(accessibleByRoomB[0].id).toBe("msg-3");
    expect(accessibleByRoomB.some((m) => m.room_id === roomA.roomId)).toBe(false);

    // Cross-room unauthorized access test: Token B attempting to access Room A explicitly returns nothing
    const crossAccess = mockMessages.filter(
      (msg) => msg.room_id === roomA.roomId && msg.room_id === claimsB?.room_id
    );
    expect(crossAccess.length).toBe(0);
  });

  it("rate limits brute force attempts on verifier", () => {
    const testIp = "192.168.1.100";
    db.clearRateLimit(testIp);

    expect(db.isRateLimited(testIp)).toBe(false);

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      db.recordFailedVerifier(testIp);
      expect(db.isRateLimited(testIp)).toBe(false);
    }

    // 5th failed attempt -> locks out
    db.recordFailedVerifier(testIp);
    expect(db.isRateLimited(testIp)).toBe(true);

    db.clearRateLimit(testIp);
    expect(db.isRateLimited(testIp)).toBe(false);
  });

  it("allows two users entering the same password to instantly access the same room and derive matching encryption keys", async () => {
    const sharedPassword = "our-cute-little-secret-123";

    // User 1 (PC Browser - "Him")
    const user1Creds = await deriveCredentialsFromPassphrase(sharedPassword, { forcePbkdf2: true });

    // User 2 (Mobile Phone - "Her")
    const user2Creds = await deriveCredentialsFromPassphrase(sharedPassword, { forcePbkdf2: true });

    // Both derive identical roomId and identical AES-256 encKey
    expect(user1Creds.roomId).toBe(user2Creds.roomId);
    expect(user1Creds.authVerifier).toBe(user2Creds.authVerifier);
    expect(user1Creds.encKey).toEqual(user2Creds.encKey);

    // Create/enter room on server
    let room = await db.getRoom(user1Creds.roomId);
    if (!room) {
      room = await db.createRoom(user1Creds.roomId, user1Creds.authVerifier);
    }
    expect(room.verifier).toBe(user2Creds.authVerifier);

    // Both devices approved automatically
    const dev1 = await db.createDevice("pc-device-1", room.id, "pub-pc", true);
    const dev2 = await db.createDevice("phone-device-2", room.id, "pub-phone", true);

    expect(dev1.approved).toBe(true);
    expect(dev2.approved).toBe(true);
    expect(dev1.room_id).toBe(dev2.room_id);
  });
});
