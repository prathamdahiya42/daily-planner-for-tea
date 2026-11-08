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

    const fileId = req.headers.get("x-file-id") || crypto.randomUUID();
    const mimeType = req.headers.get("x-mime-type") || "application/octet-stream";

    const arrayBuffer = await req.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    const buffer = Buffer.from(arrayBuffer);
    const path = await db.uploadMediaBlob(session.room_id, fileId, buffer, mimeType);

    return NextResponse.json(
      {
        success: true,
        fileId,
        path,
        size: buffer.byteLength,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Media upload failed" },
      { status: 500 }
    );
  }
}
