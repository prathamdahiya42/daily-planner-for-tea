import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/server/jwt";

export const runtime = "nodejs";

// In-memory presence tracker: roomId -> Map<deviceId, lastSeenTimestamp>
const presenceStore = new Map<string, Map<string, number>>();

const ONLINE_WINDOW_MS = 25000; // 25 seconds

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

    const { room_id, device_id } = session;
    const now = Date.now();

    if (!presenceStore.has(room_id)) {
      presenceStore.set(room_id, new Map());
    }
    const roomMap = presenceStore.get(room_id)!;
    roomMap.set(device_id, now);

    // Prune stale entries (> 2 minutes)
    for (const [devId, lastSeen] of roomMap.entries()) {
      if (now - lastSeen > 120000) {
        roomMap.delete(devId);
      }
    }

    // Determine if partner is online
    let isPartnerOnline = false;
    let partnerLastSeen: number | null = null;

    for (const [devId, lastSeen] of roomMap.entries()) {
      if (devId !== device_id) {
        partnerLastSeen = lastSeen;
        if (now - lastSeen <= ONLINE_WINDOW_MS) {
          isPartnerOnline = true;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        isPartnerOnline,
        partnerLastSeen,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Presence failed" },
      { status: 500 }
    );
  }
}

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

    const { room_id, device_id } = session;
    const now = Date.now();
    const roomMap = presenceStore.get(room_id);

    let isPartnerOnline = false;
    let partnerLastSeen: number | null = null;

    if (roomMap) {
      for (const [devId, lastSeen] of roomMap.entries()) {
        if (devId !== device_id) {
          partnerLastSeen = lastSeen;
          if (now - lastSeen <= ONLINE_WINDOW_MS) {
            isPartnerOnline = true;
          }
        }
      }
    }

    return NextResponse.json(
      {
        isPartnerOnline,
        partnerLastSeen,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Presence query failed" },
      { status: 500 }
    );
  }
}
