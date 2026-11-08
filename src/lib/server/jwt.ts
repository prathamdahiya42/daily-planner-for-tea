import { SignJWT, jwtVerify } from "jose";

const DEFAULT_DEV_SECRET = "our-little-room-default-jwt-secret-min-32-chars!!";

function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET || DEFAULT_DEV_SECRET;
  return new TextEncoder().encode(secret);
}

export interface SessionClaims {
  room_id: string;
  device_id: string;
}

/**
 * Signs a short-lived custom JWT containing room_id and device_id.
 * Accepted directly by Supabase RLS policies via `auth.jwt() ->> 'room_id'`.
 */
export async function signSessionToken(claims: SessionClaims, expiresInSeconds = 3600): Promise<string> {
  const secret = getJwtSecret();

  return await new SignJWT({
    aud: "authenticated",
    role: "authenticated",
    room_id: claims.room_id,
    device_id: claims.device_id,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secret);
}

/**
 * Verifies and decodes a session JWT.
 */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      audience: "authenticated",
    });

    if (typeof payload.room_id === "string" && typeof payload.device_id === "string") {
      return {
        room_id: payload.room_id,
        device_id: payload.device_id,
      };
    }
    return null;
  } catch {
    return null;
  }
}
