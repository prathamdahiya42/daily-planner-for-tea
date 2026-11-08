import { get, set, del } from "idb-keyval";
import { bytesToBase64, base64ToBytes, stringToBytes } from "./utils";

const IDB_DEVICE_KEYPAIR = "olr_device_ecdsa_keypair";
const IDB_DEVICE_ID = "olr_device_uuid";

export interface DeviceIdentity {
  deviceId: string;
  publicKeyJwk: string; // Serialized JWK format for registration
  privateKey: CryptoKey; // Non-extractable WebCrypto key
}

/**
 * Retrieves the existing device ECDSA P-256 identity from IndexedDB,
 * or generates a new non-extractable keypair if none exists.
 */
export async function getOrCreateDeviceIdentity(): Promise<DeviceIdentity> {
  if (typeof window === "undefined") {
    throw new Error("Device identity is only available in browser environments");
  }

  let deviceId = (await get<string>(IDB_DEVICE_ID)) || localStorage.getItem(IDB_DEVICE_ID);
  const storedPair = await get<{ publicKey: CryptoKey; privateKey: CryptoKey }>(IDB_DEVICE_KEYPAIR);

  if (deviceId && storedPair?.privateKey && storedPair?.publicKey) {
    const exportedJwk = await crypto.subtle.exportKey("jwk", storedPair.publicKey);
    return {
      deviceId,
      publicKeyJwk: JSON.stringify(exportedJwk),
      privateKey: storedPair.privateKey,
    };
  }

  // Generate new UUID for this device
  deviceId = crypto.randomUUID();

  // Generate non-extractable ECDSA P-256 keypair
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false, // Non-extractable private key!
    ["sign"]
  );

  // Save to IndexedDB
  await set(IDB_DEVICE_KEYPAIR, {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  });
  await set(IDB_DEVICE_ID, deviceId);
  localStorage.setItem(IDB_DEVICE_ID, deviceId);

  const exportedJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

  return {
    deviceId,
    publicKeyJwk: JSON.stringify(exportedJwk),
    privateKey: keyPair.privateKey,
  };
}

/**
 * Signs an authentication challenge nonce using the device's non-extractable private key.
 * Returns base64-encoded signature.
 */
export async function signChallenge(nonce: string, privateKey: CryptoKey): Promise<string> {
  const nonceBytes = stringToBytes(nonce);
  const signatureBuffer = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    privateKey,
    nonceBytes as unknown as BufferSource
  );

  return bytesToBase64(new Uint8Array(signatureBuffer));
}

/**
 * Wipes the device identity keys from IndexedDB and localStorage.
 */
export async function wipeDeviceIdentity(): Promise<void> {
  if (typeof window === "undefined") return;
  await del(IDB_DEVICE_KEYPAIR);
  await del(IDB_DEVICE_ID);
  localStorage.removeItem(IDB_DEVICE_ID);
}
