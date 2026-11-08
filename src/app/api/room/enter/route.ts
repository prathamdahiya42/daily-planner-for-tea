import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { signSessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

/**
 * POST /api/room/enter
 * Streamlined password-based entry for the couple.
 * Validates or auto-creates room, registers device as approved, and issues a session token.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, authVerifier, deviceId, nickname } = body;

    if (!roomId || !authVerifier || !deviceId) {
      return NextResponse.json(
        { error: "Missing required parameters (roomId, authVerifier, deviceId)" },
        { status: 400 }
      );
    }

    // 1. Verify or create room
    let room = await db.getRoom(roomId);
    if (!room) {
      // First person to enter creates the room
      room = await db.createRoom(roomId, authVerifier);
    } else {
      // Room exists - verify password hash
      if (room.verifier !== authVerifier) {
        return NextResponse.json(
          { error: "Incorrect room password. Please try again." },
          { status: 401 }
        );
      }
    }

    // 2. Ensure device is registered and approved
    let device = await db.getDevice(deviceId);
    if (!device) {
      device = await db.createDevice(deviceId, roomId, `device-pubkey-${deviceId}`, true);
    } else if (!device.approved || device.room_id !== roomId) {
      await db.approveDevice(deviceId);
    }

    // 3. Issue a long-lived session token (30 days)
    const token = await signSessionToken(
      {
        room_id: roomId,
        device_id: deviceId,
      },
      86400 * 30 // 30 days
    );

    return NextResponse.json({
      success: true,
      token,
      roomId,
      deviceId,
      nickname: nickname || "Love",
    });
  } catch (err: unknown) {
    console.error("[Room Enter Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
