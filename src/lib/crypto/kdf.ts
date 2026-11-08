import { APP_CONFIG } from "@/config/app.config";
import { bytesToHex, stringToBytes } from "./utils";

const MASTER_SALT = stringToBytes("our-little-room-kdf-salt-v1");

export interface DerivedRoomKeys {
  roomId: string; // 64-char hex string (derived room hash)
  authKey: Uint8Array; // 32 bytes (used to compute verifier and sign auth proofs)
  authVerifier: string; // 64-char hex string: SHA-256(authKey) sent to server
  encKey: Uint8Array; // 32 bytes: AES-256-GCM key (NEVER leaves device)
}

/**
 * Derives a 32-byte master key from a passphrase using Argon2id (hash-wasm)
 * with automatic fallback to WebCrypto PBKDF2 (600,000 iterations).
 */
export async function deriveMasterKey(
  passphrase: string,
  options?: { forcePbkdf2?: boolean }
): Promise<{ masterKey: Uint8Array; kdfUsed: "argon2id" | "pbkdf2" }> {
  const normalized = passphrase.trim().toLowerCase();

  if (!options?.forcePbkdf2) {
    try {
      const { argon2id } = await import("hash-wasm");
      const derived = await argon2id({
        password: normalized,
        salt: MASTER_SALT,
        iterations: APP_CONFIG.security.argon2.time,
        memorySize: APP_CONFIG.security.argon2.mem,
        hashLength: APP_CONFIG.security.argon2.hashLen,
        parallelism: APP_CONFIG.security.argon2.parallelism,
        outputType: "binary",
      });
      return { masterKey: derived as Uint8Array, kdfUsed: "argon2id" };
    } catch {
      // Fallback if WASM is blocked or fails
    }
  }

  // WebCrypto PBKDF2 Fallback (600,000 iterations, SHA-256)
  const baseKey = await crypto.subtle.importKey(
    "raw",
    stringToBytes(normalized) as unknown as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: MASTER_SALT as unknown as BufferSource,
      iterations: APP_CONFIG.security.pbkdf2Iterations,
      hash: "SHA-256",
    },
    baseKey,
    256 // 32 bytes
  );

  return { masterKey: new Uint8Array(derivedBuffer), kdfUsed: "pbkdf2" };
}

/**
 * Splits the 32-byte master key using HKDF-SHA256 into authKey, encKey, and roomId.
 */
export async function deriveRoomKeys(masterKey: Uint8Array): Promise<DerivedRoomKeys> {
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    masterKey as unknown as BufferSource,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );

  const hkdfSalt = stringToBytes("our-little-room-hkdf-salt") as unknown as BufferSource;

  const [authBits, encBits, roomIdBits] = await Promise.all([
    crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: hkdfSalt,
        info: stringToBytes("our-little-room:authKey") as unknown as BufferSource,
      },
      hkdfKey,
      256
    ),
    crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: hkdfSalt,
        info: stringToBytes("our-little-room:encKey") as unknown as BufferSource,
      },
      hkdfKey,
      256
    ),
    crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: hkdfSalt,
        info: stringToBytes("our-little-room:roomId") as unknown as BufferSource,
      },
      hkdfKey,
      256
    ),
  ]);

  const authKey = new Uint8Array(authBits);
  const encKey = new Uint8Array(encBits);
  const roomId = bytesToHex(new Uint8Array(roomIdBits));

  // Compute SHA-256 verifier for the server: SHA-256(authKey)
  const verifierBuffer = await crypto.subtle.digest(
    "SHA-256",
    authKey as unknown as BufferSource
  );
  const authVerifier = bytesToHex(new Uint8Array(verifierBuffer));

  return {
    roomId,
    authKey,
    authVerifier,
    encKey,
  };
}

/**
 * End-to-end derivation helper from a raw passphrase to room credentials.
 */
export async function deriveCredentialsFromPassphrase(
  passphrase: string,
  options?: { forcePbkdf2?: boolean }
): Promise<DerivedRoomKeys & { kdfUsed: "argon2id" | "pbkdf2" }> {
  const { masterKey, kdfUsed } = await deriveMasterKey(passphrase, options);
  const keys = await deriveRoomKeys(masterKey);
  return { ...keys, kdfUsed };
}
