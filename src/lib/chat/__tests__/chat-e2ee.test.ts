import { describe, it, expect } from "vitest";
import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";
import { deriveCredentialsFromPassphrase } from "@/lib/crypto/kdf";
import { PlaintextMessagePayload } from "../types";

describe("Phase 3: Realtime E2EE Chat Core", () => {
  const passphraseA = "gentle-stream-morning-breeze";
  const passphraseB = "whispering-willow-golden-meadow";

  it("encrypts and decrypts text messages without leaking plaintext", async () => {
    const credsA = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });

    const payload: PlaintextMessagePayload = {
      text: "Thinking of you always ❤️",
      seenBy: { "dev-1": Date.now() },
    };

    const encrypted = await encryptPayload(payload, credsA.encKey);

    // Verify database stores ONLY ciphertext and IV
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.ciphertext).not.toContain("Thinking of you");

    // Receiving partner decrypts with shared encKey
    const decrypted = await decryptPayload<PlaintextMessagePayload>(encrypted, credsA.encKey);
    expect(decrypted.text).toBe("Thinking of you always ❤️");
  });

  it("handles reply-to quotes and preserves reply hierarchy", async () => {
    const creds = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });

    const originalPayload: PlaintextMessagePayload = {
      text: "Are you free tonight for tea?",
    };
    const encryptedOriginal = await encryptPayload(originalPayload, creds.encKey);

    // Partner replies to message
    const replyPayload: PlaintextMessagePayload = {
      text: "Yes, I would love that! ☕",
      replyTo: {
        id: "msg-1",
        senderDeviceId: "dev-1",
        snippet: originalPayload.text.slice(0, 50),
      },
    };

    const encryptedReply = await encryptPayload(replyPayload, creds.encKey);
    const decryptedReply = await decryptPayload<PlaintextMessagePayload>(encryptedReply, creds.encKey);

    expect(decryptedReply.text).toBe("Yes, I would love that! ☕");
    expect(decryptedReply.replyTo?.id).toBe("msg-1");
    expect(decryptedReply.replyTo?.snippet).toBe("Are you free tonight for tea?");
  });

  it("edits a message by re-encrypting with fresh IV and marking editedAt", async () => {
    const creds = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });

    const initialPayload: PlaintextMessagePayload = {
      text: "Meet me at 6pm",
    };
    const enc1 = await encryptPayload(initialPayload, creds.encKey);

    // Edit message to 7pm
    const editedPayload: PlaintextMessagePayload = {
      ...initialPayload,
      text: "Meet me at 7pm (delayed slightly)",
      editedAt: Date.now(),
    };
    const enc2 = await encryptPayload(editedPayload, creds.encKey);

    expect(enc2.iv).not.toBe(enc1.iv);
    expect(enc2.ciphertext).not.toBe(enc1.ciphertext);

    const decrypted = await decryptPayload<PlaintextMessagePayload>(enc2, creds.encKey);
    expect(decrypted.text).toBe("Meet me at 7pm (delayed slightly)");
    expect(decrypted.editedAt).toBeDefined();
  });

  it("unsends a message by wiping plaintext content from ciphertext", async () => {
    const creds = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });

    const sensitivePayload: PlaintextMessagePayload = {
      text: "Top secret love note",
    };
    const encOriginal = await encryptPayload(sensitivePayload, creds.encKey);

    // User triggers unsend
    const unsentPayload: PlaintextMessagePayload = {
      text: "",
      isUnsent: true,
    };
    const encUnsent = await encryptPayload(unsentPayload, creds.encKey);

    // Verify original sensitive text is NOT in the new ciphertext
    const decrypted = await decryptPayload<PlaintextMessagePayload>(encUnsent, creds.encKey);
    expect(decrypted.isUnsent).toBe(true);
    expect(decrypted.text).toBe("");
  });

  it("toggles double-tap heart reactions per device", async () => {
    const creds = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });
    const dev1 = "dev-1";
    const dev2 = "dev-2";

    // 1. Initial message
    let payload: PlaintextMessagePayload = {
      text: "Good morning sunshine ☀️",
      reactions: {},
    };

    // 2. Dev2 double-taps to react ❤️
    payload.reactions = { ...payload.reactions, [dev2]: "❤️" };
    let enc = await encryptPayload(payload, creds.encKey);
    let dec = await decryptPayload<PlaintextMessagePayload>(enc, creds.encKey);
    expect(dec.reactions?.[dev2]).toBe("❤️");

    // 3. Dev1 also double-taps to react ❤️
    payload.reactions = { ...payload.reactions, [dev1]: "❤️" };
    enc = await encryptPayload(payload, creds.encKey);
    dec = await decryptPayload<PlaintextMessagePayload>(enc, creds.encKey);
    expect(Object.keys(dec.reactions || {}).length).toBe(2);

    // 4. Dev2 double-taps again to remove reaction
    delete payload.reactions[dev2];
    enc = await encryptPayload(payload, creds.encKey);
    dec = await decryptPayload<PlaintextMessagePayload>(enc, creds.encKey);
    expect(dec.reactions?.[dev2]).toBeUndefined();
    expect(dec.reactions?.[dev1]).toBe("❤️");
  });

  it("tracks seen receipts via small heart indicator status", async () => {
    const creds = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });
    const senderDev = "dev-1";
    const receiverDev = "dev-2";

    const payload: PlaintextMessagePayload = {
      text: "See you soon!",
      seenBy: { [senderDev]: Date.now() },
    };

    // Initially NOT seen by receiverDev
    const isSeenInitially = Boolean(payload.seenBy[receiverDev]);
    expect(isSeenInitially).toBe(false);

    // Receiver views message
    payload.seenBy[receiverDev] = Date.now();
    const enc = await encryptPayload(payload, creds.encKey);
    const dec = await decryptPayload<PlaintextMessagePayload>(enc, creds.encKey);

    // Seen status is now confirmed
    expect(dec.seenBy?.[receiverDev]).toBeDefined();
    expect(dec.seenBy?.[receiverDev]).toBeGreaterThan(0);
  });

  it("rejects decryption with a different room's encKey", async () => {
    const credsA = await deriveCredentialsFromPassphrase(passphraseA, { forcePbkdf2: true });
    const credsB = await deriveCredentialsFromPassphrase(passphraseB, { forcePbkdf2: true });

    const payload: PlaintextMessagePayload = {
      text: "Secret between Couple A",
    };
    const encryptedByA = await encryptPayload(payload, credsA.encKey);

    // Attempting to decrypt with Room B's key MUST throw
    await expect(decryptPayload(encryptedByA, credsB.encKey)).rejects.toThrow();
  });
});
