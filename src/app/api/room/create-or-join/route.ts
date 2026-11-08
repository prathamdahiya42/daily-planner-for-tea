import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, verifier, deviceId, devicePublicKey } = body;

    if (!roomId || !verifier || !deviceId || !devicePublicKey) {
      return NextResponse.json(
        { error: "Missing required registration parameters" },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for") || "local";
    if (db.isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const existingRoom = await db.getRoom(roomId);

    // Case A: Create new room
    if (!existingRoom) {
      await db.createRoom(roomId, verifier);
      await db.createDevice(deviceId, roomId, devicePublicKey, true); // First device is auto-approved

      return NextResponse.json({
        status: "created",
        approved: true,
        deviceId,
        roomId,
      });
    }

    // Case B: Join existing room
    if (existingRoom.verifier !== verifier) {
      db.recordFailedVerifier(clientIp);
      return NextResponse.json(
        { error: "Passphrase verification failed" },
        { status: 401 }
      );
    }

    db.clearRateLimit(clientIp);

    // Check device count and approval status
    const roomDevices = await db.getDevicesByRoom(roomId);
    const approvedCount = roomDevices.filter((d) => d.approved).length;

    const existingDevice = roomDevices.find((d) => d.id === deviceId);
    if (existingDevice) {
      return NextResponse.json({
        status: existingDevice.approved ? "approved" : "pending_approval",
        approved: existingDevice.approved,
        deviceId: existingDevice.id,
        roomId,
      });
    }

    if (approvedCount >= 2) {
      return NextResponse.json(
        { error: "This room already has the maximum of 2 approved devices" },
        { status: 403 }
      );
    }

    // Second device requires approval from the first approved device
    await db.createDevice(deviceId, roomId, devicePublicKey, false);

    return NextResponse.json({
      status: "pending_approval",
      approved: false,
      deviceId,
      roomId,
    });
  } catch (err: unknown) {
    console.error("Room create/join error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
