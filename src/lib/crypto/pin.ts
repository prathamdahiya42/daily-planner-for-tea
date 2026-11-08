import { APP_CONFIG } from "@/config/app.config";
import { base64ToBytes, bytesToBase64, stringToBytes } from "./utils";

export interface WrappedKeyPackage {
  salt: string; // Base64 16 bytes
  iv: string; // Base64 12 bytes
  wrappedCiphertext: string; // Base64 wrapped raw encKey
}

const PIN_ATTEMPTS_STORAGE_KEY = "olr_pin_attempts";
const WRAPPED_KEY_STORAGE_KEY = "olr_wrapped_enc_key";

/**
 * Derive a 256-bit wrapping key from the 6-digit PIN and a salt.
 */
async function derivePinWrappingKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const pinBytes = stringToBytes(pin);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    pinBytes as unknown as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Wraps the 32-byte encKey with an AES-GCM key derived from the user's PIN.
 */
export async function wrapEncKey(encKey: Uint8Array, pin: string): Promise<WrappedKeyPackage> {
  if (pin.length !== APP_CONFIG.security.pinLength || !/^\d+$/.test(pin)) {
    throw new Error(`PIN must be exactly ${APP_CONFIG.security.pinLength} digits`);
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await derivePinWrappingKey(pin, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    wrappingKey,
    encKey as unknown as BufferSource
  );

  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    wrappedCiphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
  };
}

/**
 * Unwraps the 32-byte encKey using the user's PIN.
 * Throws an error on wrong PIN or corrupted data.
 */
export async function unwrapEncKey(
  wrapped: WrappedKeyPackage,
  pin: string
): Promise<Uint8Array> {
  const salt = base64ToBytes(wrapped.salt);
  const iv = base64ToBytes(wrapped.iv);
  const ciphertext = base64ToBytes(wrapped.wrappedCiphertext);

  const wrappingKey = await derivePinWrappingKey(pin, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    wrappingKey,
    ciphertext as unknown as BufferSource
  );

  return new Uint8Array(decryptedBuffer);
}

/**
 * PIN Attempt Management & Security Wipe
 */
export class PinSecurityManager {
  static getFailedAttempts(): number {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(PIN_ATTEMPTS_STORAGE_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  static getRemainingAttempts(): number {
    return Math.max(0, APP_CONFIG.security.maxPinAttempts - this.getFailedAttempts());
  }

  static recordFailedAttempt(): { remaining: number; wiped: boolean } {
    const current = this.getFailedAttempts() + 1;
    if (typeof window !== "undefined") {
      localStorage.setItem(PIN_ATTEMPTS_STORAGE_KEY, current.toString());
    }

    if (current >= APP_CONFIG.security.maxPinAttempts) {
      this.wipeLocalKeys();
      return { remaining: 0, wiped: true };
    }

    return {
      remaining: APP_CONFIG.security.maxPinAttempts - current,
      wiped: false,
    };
  }

  static recordSuccess(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(PIN_ATTEMPTS_STORAGE_KEY);
    }
  }

  static wipeLocalKeys(): void {
    if (typeof window === "undefined") return;

    // Remove all local storage room and key items
    localStorage.removeItem(WRAPPED_KEY_STORAGE_KEY);
    localStorage.removeItem(PIN_ATTEMPTS_STORAGE_KEY);
    localStorage.removeItem("olr_room_id");
    localStorage.removeItem("olr_device_id");
    localStorage.removeItem("olr_auth_token");
    localStorage.removeItem("olr_has_paired");

    // Clean up IndexedDB if running in browser
    if (typeof indexedDB !== "undefined") {
      try {
        indexedDB.deleteDatabase("keyval-store");
        indexedDB.deleteDatabase("our-little-room-db");
      } catch {
        // Silently catch in restricted contexts
      }
    }
  }
}
