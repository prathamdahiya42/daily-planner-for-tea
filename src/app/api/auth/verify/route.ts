import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { verifyDeviceSignature } from "@/lib/server/ecdsa-verify";
import { signSessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { deviceId, nonce, signature } = await req.json();

    if (!deviceId || !nonce || !signature) {
      return NextResponse.json(
        { error: "Missing verification parameters" },
        { status: 400 }
      );
    }

    const device = await db.getDevice(deviceId);
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Verify and consume the nonce
    const isValidNonce = await db.verifyAndConsumeChallenge(deviceId, nonce);
    if (!isValidNonce) {
      return NextResponse.json(
        { error: "Invalid or expired challenge nonce" },
        { status: 401 }
      );
    }

    // Verify cryptographic ECDSA signature with device's registered public key
    const isSignatureValid = await verifyDeviceSignature(
      device.public_key,
      nonce,
      signature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Cryptographic signature verification failed" },
        { status: 401 }
      );
    }

    // Check approval status
    if (!device.approved) {
      return NextResponse.json({
        approved: false,
        deviceId: device.id,
        roomId: device.room_id,
        message: "Device is pending approval from partner",
      });
    }

    // Issue short-lived session JWT for Supabase RLS
    const token = await signSessionToken({
      room_id: device.room_id,
      device_id: device.id,
    });

    return NextResponse.json({
      approved: true,
      token,
      deviceId: device.id,
      roomId: device.room_id,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Authentication error" },
      { status: 500 }
    );
  }
}
