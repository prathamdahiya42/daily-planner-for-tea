import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { verifySessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }

    const { pendingDeviceId } = await req.json();
    if (!pendingDeviceId) {
      return NextResponse.json({ error: "Missing pendingDeviceId" }, { status: 400 });
    }

    // Verify caller device is an approved device in this room
    const callerDevice = await db.getDevice(session.device_id);
    if (!callerDevice || !callerDevice.approved || callerDevice.room_id !== session.room_id) {
      return NextResponse.json({ error: "Caller device is not authorized to approve" }, { status: 403 });
    }

    // Verify target device exists in the same room
    const targetDevice = await db.getDevice(pendingDeviceId);
    if (!targetDevice || targetDevice.room_id !== session.room_id) {
      return NextResponse.json({ error: "Target device not found in this room" }, { status: 404 });
    }

    // Check that room does not already exceed 2 approved devices
    const roomDevices = await db.getDevicesByRoom(session.room_id);
    const approvedCount = roomDevices.filter((d) => d.approved).length;

    if (approvedCount >= 2 && !targetDevice.approved) {
      return NextResponse.json(
        { error: "Room already reached maximum limit of 2 approved devices" },
        { status: 403 }
      );
    }

    await db.approveDevice(pendingDeviceId);

    return NextResponse.json({
      success: true,
      approvedDeviceId: pendingDeviceId,
      roomId: session.room_id,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
