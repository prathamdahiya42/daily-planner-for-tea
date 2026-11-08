import { base64ToBytes, stringToBytes } from "../crypto/utils";

/**
 * Verifies an ECDSA P-256 signature against a challenge nonce and public key JWK.
 */
export async function verifyDeviceSignature(
  publicKeyJwkString: string,
  nonce: string,
  signatureBase64: string
): Promise<boolean> {
  try {
    const jwk = JSON.parse(publicKeyJwkString);
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["verify"]
    );

    const nonceBytes = stringToBytes(nonce);
    const signatureBytes = base64ToBytes(signatureBase64);

    return await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      publicKey,
      signatureBytes as unknown as BufferSource,
      nonceBytes as unknown as BufferSource
    );
  } catch (err) {
    console.error("ECDSA verification error:", err);
    return false;
  }
}
