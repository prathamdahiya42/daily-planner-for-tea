import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { verifySessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

// PATCH /api/messages/[id] - Update message ciphertext (edit, unsend, react, seen)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { ciphertext, iv, type } = body;

    if (!ciphertext || !iv) {
      return NextResponse.json({ error: "Missing ciphertext or iv" }, { status: 400 });
    }

    const updated = await db.updateMessage(id, session.room_id, {
      ciphertext,
      iv,
      ...(type ? { type } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: "Message not found in this room" }, { status: 404 });
    }

    return NextResponse.json({ message: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/[id] - Delete message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }

    const deleted = await db.deleteMessage(id, session.room_id);
    if (!deleted) {
      return NextResponse.json({ error: "Message not found in this room" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
