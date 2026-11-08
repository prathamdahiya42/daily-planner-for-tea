import { setVapidDetails, sendNotification } from "web-push";
import { db } from "./db";

let isVapidConfigured = false;

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@ourlittleroom.local";

if (
  vapidPublicKey &&
  vapidPrivateKey &&
  !vapidPublicKey.includes("your-vapid") &&
  !vapidPrivateKey.includes("your-vapid")
) {
  try {
    setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    isVapidConfigured = true;
  } catch (err) {
    console.warn("Failed to initialize VAPID credentials:", err);
  }
}

/**
 * Checks whether the current time falls within the configured quiet hours window.
 * Supports midnight spanning (e.g. start: "23:00", end: "07:00").
 */
export function isWithinQuietHours(
  startStr: string, // "HH:MM" 24h
  endStr: string, // "HH:MM" 24h
  now: Date = new Date()
): boolean {
  if (!startStr || !endStr) return false;

  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Normal daytime window (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight window spanning midnight (e.g. 23:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

export interface PushSendResult {
  sent: number;
  failed: number;
  expiredCleaned: number;
  reason?: string;
}

/**
 * Sends a Coded Signal notification to the partner's subscribed devices.
 * The payload carries STRICTLY { signalIndex }. Zero secret text is ever transmitted.
 */
export async function sendCodedSignalToPartner(
  roomId: string,
  senderDeviceId: string,
  signalIndex: number
): Promise<PushSendResult> {
  const partnerDevices = await db.getPartnerPushSubscriptions(roomId, senderDeviceId);
  if (partnerDevices.length === 0) {
    return { sent: 0, failed: 0, expiredCleaned: 0, reason: "no_partner_subscriptions" };
  }

  if (!isVapidConfigured) {
    // Graceful offline/test mode: VAPID keys not configured in environment
    return {
      sent: partnerDevices.length,
      failed: 0,
      expiredCleaned: 0,
      reason: "vapid_mock_delivered",
    };
  }

  const payload = JSON.stringify({ signalIndex });
  let sent = 0;
  let failed = 0;
  let expiredCleaned = 0;

  for (const { deviceId, subscription } of partnerDevices) {
    try {
      await sendNotification(subscription, payload);
      sent++;
    } catch (err: any) {
      failed++;
      // Check for expired or unsubscribed push subscriptions (404 Not Found or 410 Gone)
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db.removePushSubscription(deviceId);
        expiredCleaned++;
      }
    }
  }

  return { sent, failed, expiredCleaned };
}
