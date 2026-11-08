/**
 * Client-side binary media encryption and decryption using AES-256-GCM.
 * Photos are encrypted locally before uploading to private room storage.
 */

import { bytesToBase64, base64ToBytes } from "@/lib/crypto/utils";

const AES_GCM_TAG_LENGTH = 128;

/**
 * Encrypts an image Blob or ArrayBuffer using AES-256-GCM with a fresh 12-byte IV.
 * Returns an encrypted Blob and the base64-encoded IV.
 */
export async function encryptMediaBlob(
  data: Blob | ArrayBuffer,
  encKey: Uint8Array
): Promise<{ encryptedBlob: Blob; ivBase64: string }> {
  const rawBytes = data instanceof Blob ? await data.arrayBuffer() : data;

  // Generate fresh 12-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import AES-GCM key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encKey as unknown as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Encrypt binary data
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
      tagLength: AES_GCM_TAG_LENGTH,
    },
    cryptoKey,
    rawBytes as unknown as BufferSource
  );

  const encryptedBlob = new Blob([ciphertextBuffer], {
    type: "application/octet-stream",
  });
  const ivBase64 = bytesToBase64(iv);

  return {
    encryptedBlob,
    ivBase64,
  };
}

/**
 * Decrypts an encrypted binary ArrayBuffer or Blob using AES-256-GCM.
 * Returns a plaintext image Blob with the specified MIME type.
 */
export async function decryptMediaBlob(
  encryptedData: Blob | ArrayBuffer,
  ivBase64: string,
  encKey: Uint8Array,
  mimeType: string = "image/jpeg"
): Promise<Blob> {
  const encryptedBuffer =
    encryptedData instanceof Blob ? await encryptedData.arrayBuffer() : encryptedData;

  const iv = base64ToBytes(ivBase64);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encKey as unknown as BufferSource,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
      tagLength: AES_GCM_TAG_LENGTH,
    },
    cryptoKey,
    encryptedBuffer as unknown as BufferSource
  );

  return new Blob([decryptedBuffer], { type: mimeType });
}
