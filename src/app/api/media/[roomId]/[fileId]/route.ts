import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { verifySessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ roomId: string; fileId: string }> }
) {
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

    const { roomId, fileId } = await context.params;

    // Strict room isolation: device can only access media from its own room
    if (session.room_id !== roomId) {
      return NextResponse.json({ error: "Forbidden: cross-room access denied" }, { status: 403 });
    }

    const media = await db.getMediaBlob(roomId, fileId);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return new NextResponse(media.data as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to retrieve media" },
      { status: 500 }
    );
  }
}
