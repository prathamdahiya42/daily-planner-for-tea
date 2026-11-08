import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { bytesToHex } from "@/lib/crypto/utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }

    const device = await db.getDevice(deviceId);
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const nonce = bytesToHex(randomBytes);

    await db.saveChallenge(deviceId, nonce);

    return NextResponse.json({ nonce });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to issue challenge" },
      { status: 500 }
    );
  }
}
