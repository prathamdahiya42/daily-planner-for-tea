import { base64ToBytes, bytesToBase64, bytesToString, stringToBytes } from "./utils";

export interface EncryptedItem {
  ciphertext: string; // Base64 ciphertext + 16-byte auth tag
  iv: string; // Base64 12-byte IV
}

/**
 * Import raw 32-byte encKey into a WebCrypto CryptoKey for AES-GCM.
 */
export async function importAesGcmKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    rawKey as unknown as BufferSource,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt any JSON-serializable payload or binary buffer using AES-256-GCM
 * with a fresh 12-byte IV for every item.
 */
export async function encryptPayload(
  data: unknown,
  key: CryptoKey | Uint8Array
): Promise<EncryptedItem> {
  const cryptoKey = key instanceof Uint8Array ? await importAesGcmKey(key) : key;
  const iv = crypto.getRandomValues(new Uint8Array(12));

  let plaintextBytes: Uint8Array;
  if (data instanceof Uint8Array) {
    plaintextBytes = data;
  } else if (typeof data === "string") {
    plaintextBytes = stringToBytes(data);
  } else {
    plaintextBytes = stringToBytes(JSON.stringify(data));
  }

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
      tagLength: 128, // 16-byte authentication tag
    },
    cryptoKey,
    plaintextBytes as unknown as BufferSource
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    iv: bytesToBase64(iv),
  };
}

/**
 * Decrypt an AES-256-GCM ciphertext. Throws an error if tampered with or if key is wrong.
 */
export async function decryptPayload<T = unknown>(
  item: EncryptedItem,
  key: CryptoKey | Uint8Array,
  asBinary = false
): Promise<T> {
  const cryptoKey = key instanceof Uint8Array ? await importAesGcmKey(key) : key;
  const iv = base64ToBytes(item.iv);
  const ciphertextBytes = base64ToBytes(item.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
      tagLength: 128,
    },
    cryptoKey,
    ciphertextBytes as unknown as BufferSource
  );

  const decryptedBytes = new Uint8Array(decryptedBuffer);

  if (asBinary) {
    return decryptedBytes as unknown as T;
  }

  const text = bytesToString(decryptedBytes);
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
