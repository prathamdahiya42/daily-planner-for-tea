import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/server/jwt";
import { isWithinQuietHours, sendCodedSignalToPartner } from "@/lib/server/push";

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

    const body = await req.json();
    const { signalIndex, quietHours } = body;

    if (typeof signalIndex !== "number" || signalIndex < 0 || signalIndex > 5) {
      return NextResponse.json({ error: "signalIndex must be between 0 and 5" }, { status: 400 });
    }

    // Check quiet hours if enabled
    if (quietHours?.enabled && quietHours.start && quietHours.end) {
      if (isWithinQuietHours(quietHours.start, quietHours.end)) {
        return NextResponse.json(
          {
            success: true,
            suppressed: true,
            reason: "quiet_hours",
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    const result = await sendCodedSignalToPartner(
      session.room_id,
      session.device_id,
      signalIndex
    );

    return NextResponse.json(
      {
        success: true,
        sent: result.sent,
        failed: result.failed,
        cleaned: result.expiredCleaned,
        reason: result.reason,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to dispatch signal" },
      { status: 500 }
    );
  }
}
