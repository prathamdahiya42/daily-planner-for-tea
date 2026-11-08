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

    const result = await db.cleanupExpiredMessages(session.room_id);

    return NextResponse.json(
      {
        success: true,
        deletedMessages: result.deletedMessages,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
