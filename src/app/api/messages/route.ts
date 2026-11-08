import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { verifySessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

// GET /api/messages - Fetch encrypted messages for room
export async function GET(req: NextRequest) {
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

    const messages = await db.getMessages(session.room_id);
    return NextResponse.json({ messages });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new encrypted message
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

    const body = await req.json();
    const { id, ciphertext, iv, type = "text", expiresAt = null } = body;

    if (!id || !ciphertext || !iv) {
      return NextResponse.json(
        { error: "Missing required message parameters" },
        { status: 400 }
      );
    }

    const messageRecord = await db.insertMessage({
      id,
      room_id: session.room_id,
      sender_device_id: session.device_id,
      ciphertext,
      iv,
      type,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    return NextResponse.json({ message: messageRecord }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
