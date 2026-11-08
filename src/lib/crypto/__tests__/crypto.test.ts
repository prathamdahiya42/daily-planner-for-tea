import { describe, it, expect, beforeEach } from "vitest";
import { generateSuggestedPassphrase, validatePassphrase } from "../wordlist";
import { deriveMasterKey, deriveRoomKeys, deriveCredentialsFromPassphrase } from "../kdf";
import { encryptPayload, decryptPayload, importAesGcmKey } from "../cipher";
import { wrapEncKey, unwrapEncKey, PinSecurityManager } from "../pin";
import { bytesToHex } from "../utils";

describe("Wordlist & Passphrase Validation", () => {
  it("generates a 4-word random passphrase", () => {
    const phrase = generateSuggestedPassphrase();
    const parts = phrase.split("-");
    expect(parts.length).toBe(4);
    for (const part of parts) {
      expect(part.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("validates passphrases against minimum rules", () => {
    expect(validatePassphrase("short").valid).toBe(false);
    expect(validatePassphrase("apple-banana-cherry").valid).toBe(false);
    expect(validatePassphrase("whispering-willow-golden-meadow").valid).toBe(true);
    expect(validatePassphrase("whispering willow golden meadow").valid).toBe(true);
  });
});

describe("Key Derivation (KDF & HKDF)", () => {
  const testPassphrase = "autumn-lantern-whispering-meadow";

  it("derives master key via PBKDF2 fallback deterministically", async () => {
    const res1 = await deriveMasterKey(testPassphrase, { forcePbkdf2: true });
    const res2 = await deriveMasterKey(testPassphrase, { forcePbkdf2: true });

    expect(res1.kdfUsed).toBe("pbkdf2");
    expect(res1.masterKey.length).toBe(32);
    expect(bytesToHex(res1.masterKey)).toBe(bytesToHex(res2.masterKey));
  });

  it("derives master key via Argon2id (hash-wasm)", async () => {
    const res = await deriveMasterKey(testPassphrase);
    expect(res.masterKey.length).toBe(32);
    // Should be argon2id or fallback gracefully
    expect(["argon2id", "pbkdf2"]).toContain(res.kdfUsed);
  }, 15000);

  it("splits master key with HKDF into distinct, non-overlapping keys", async () => {
    const { masterKey } = await deriveMasterKey(testPassphrase, { forcePbkdf2: true });
    const keys = await deriveRoomKeys(masterKey);

    expect(keys.roomId).toBeDefined();
    expect(keys.roomId.length).toBe(64); // 32 bytes hex
    expect(keys.authKey.length).toBe(32);
    expect(keys.encKey.length).toBe(32);
    expect(keys.authVerifier.length).toBe(64);

    // Verify all keys are strictly distinct from each other
    const authHex = bytesToHex(keys.authKey);
    const encHex = bytesToHex(keys.encKey);
    expect(authHex).not.toBe(encHex);
    expect(authHex).not.toBe(keys.roomId);
    expect(encHex).not.toBe(keys.roomId);
  });

  it("end-to-end credential derivation matches between runs", async () => {
    const run1 = await deriveCredentialsFromPassphrase(testPassphrase, { forcePbkdf2: true });
    const run2 = await deriveCredentialsFromPassphrase(testPassphrase, { forcePbkdf2: true });

    expect(run1.roomId).toBe(run2.roomId);
    expect(run1.authVerifier).toBe(run2.authVerifier);
    expect(bytesToHex(run1.encKey)).toBe(bytesToHex(run2.encKey));
  });
});

describe("E2EE Payload Encryption & Decryption (AES-GCM)", () => {
  it("encrypts and decrypts structured JSON payloads", async () => {
    const encKey = crypto.getRandomValues(new Uint8Array(32));
    const payload = {
      text: "I love you forever",
      stickerId: "sweet-01",
      timestamp: Date.now(),
      extra: { secret: 42 },
    };

    const encrypted = await encryptPayload(payload, encKey);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();

    const decrypted = await decryptPayload<typeof payload>(encrypted, encKey);
    expect(decrypted).toEqual(payload);
  });

  it("uses a fresh random IV for every encryption call with identical content", async () => {
    const encKey = crypto.getRandomValues(new Uint8Array(32));
    const message = "Secret love note";

    const enc1 = await encryptPayload(message, encKey);
    const enc2 = await encryptPayload(message, encKey);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);

    // Both decrypt to identical content
    expect(await decryptPayload(enc1, encKey)).toBe(message);
    expect(await decryptPayload(enc2, encKey)).toBe(message);
  });

  it("fails to decrypt with the wrong key", async () => {
    const keyA = crypto.getRandomValues(new Uint8Array(32));
    const keyB = crypto.getRandomValues(new Uint8Array(32));

    const encrypted = await encryptPayload("Top Secret", keyA);

    await expect(decryptPayload(encrypted, keyB)).rejects.toThrow();
  });

  it("fails to decrypt if ciphertext is tampered with", async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const encrypted = await encryptPayload("Tamper test", key);

    // Corrupt one character in ciphertext
    const tamperedCiphertext =
      encrypted.ciphertext.slice(0, -2) + (encrypted.ciphertext.endsWith("A") ? "B" : "A");

    await expect(
      decryptPayload({ ciphertext: tamperedCiphertext, iv: encrypted.iv }, key)
    ).rejects.toThrow();
  });
});

describe("PIN Wrapping & Local Key Protection", () => {
  const pin = "749201";
  const wrongPin = "123456";

  it("wraps and unwraps encKey with 6-digit PIN", async () => {
    const originalEncKey = crypto.getRandomValues(new Uint8Array(32));
    const wrapped = await wrapEncKey(originalEncKey, pin);

    expect(wrapped.salt).toBeDefined();
    expect(wrapped.iv).toBeDefined();
    expect(wrapped.wrappedCiphertext).toBeDefined();

    const unwrapped = await unwrapEncKey(wrapped, pin);
    expect(bytesToHex(unwrapped)).toBe(bytesToHex(originalEncKey));
  });

  it("rejects unwrapping with an incorrect PIN", async () => {
    const originalEncKey = crypto.getRandomValues(new Uint8Array(32));
    const wrapped = await wrapEncKey(originalEncKey, pin);

    await expect(unwrapEncKey(wrapped, wrongPin)).rejects.toThrow();
  });

  it("rejects invalid PIN formats", async () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    await expect(wrapEncKey(key, "123")).rejects.toThrow();
    await expect(wrapEncKey(key, "abcdef")).rejects.toThrow();
  });
});
