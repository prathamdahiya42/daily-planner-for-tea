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

    const { subscription } = await req.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid push subscription object" }, { status: 400 });
    }

    await db.savePushSubscription(session.device_id, subscription);

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Subscription failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    await db.removePushSubscription(session.device_id);

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unsubscribe failed" },
      { status: 500 }
    );
  }
}
