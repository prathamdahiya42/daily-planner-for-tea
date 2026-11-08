/**
 * Client-side encrypted room settings manager.
 * Stores nicknames, relationship anniversary date, disappearing timer, and theme.
 * All settings are encrypted locally with the room's encKey before writing to localStorage.
 */

import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";
import { APP_CONFIG } from "@/config/app.config";

export type DisappearingTimer = "off" | "1h" | "1d" | "1w";

export type BackgroundTheme =
  | "warm-rose"
  | "honey-amber"
  | "soft-lavender"
  | "cozy-midnight"
  | "cloud-peach";

export interface RoomSettings {
  myNickname: string;
  partnerNickname: string;
  togetherSince: string; // ISO date string YYYY-MM-DD
  disappearingTimer: DisappearingTimer;
  backgroundTheme: BackgroundTheme;
  myColor: string;
  partnerColor: string;
  partnerPronoun: "she" | "he" | "they";
  customSignalLabels: Record<number, string>;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "HH:MM"
  quietHoursEnd: string; // "HH:MM"
  autoOnlineSignal: boolean;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  myNickname: "Me",
  partnerNickname: "My Love",
  togetherSince: "",
  disappearingTimer: "off",
  backgroundTheme: "warm-rose",
  myColor: "rose",
  partnerColor: "amber",
  partnerPronoun: "she",
  customSignalLabels: {
    0: APP_CONFIG.codedSignals[0].defaultSecretLabel,
    1: APP_CONFIG.codedSignals[1].defaultSecretLabel,
    2: APP_CONFIG.codedSignals[2].defaultSecretLabel,
    3: APP_CONFIG.codedSignals[3].defaultSecretLabel,
    4: APP_CONFIG.codedSignals[4].defaultSecretLabel,
    5: APP_CONFIG.codedSignals[5].defaultSecretLabel,
  },
  quietHoursEnabled: false,
  quietHoursStart: "23:00",
  quietHoursEnd: "07:00",
  autoOnlineSignal: false,
};

export const BACKGROUND_THEMES: Record<
  BackgroundTheme,
  { name: string; bgClass: string; cardClass: string; accentColor: string }
> = {
  "warm-rose": {
    name: "Warm Rose",
    bgClass: "bg-gradient-to-b from-rose-50/70 via-pink-50/40 to-white",
    cardClass: "bg-white/90 border-rose-100",
    accentColor: "#f43f5e",
  },
  "honey-amber": {
    name: "Honey Amber",
    bgClass: "bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-stone-50",
    cardClass: "bg-white/90 border-amber-100",
    accentColor: "#f59e0b",
  },
  "soft-lavender": {
    name: "Soft Lavender",
    bgClass: "bg-gradient-to-b from-purple-50/70 via-pink-50/30 to-slate-50",
    cardClass: "bg-white/90 border-purple-100",
    accentColor: "#a855f7",
  },
  "cozy-midnight": {
    name: "Cozy Midnight",
    bgClass: "bg-gradient-to-b from-slate-900 via-purple-950/80 to-slate-900 text-slate-100",
    cardClass: "bg-slate-800/90 border-slate-700",
    accentColor: "#ec4899",
  },
  "cloud-peach": {
    name: "Cloud Peach",
    bgClass: "bg-gradient-to-b from-orange-50/70 via-rose-50/40 to-amber-50/20",
    cardClass: "bg-white/90 border-orange-100",
    accentColor: "#fb923c",
  },
};

/**
 * Calculates the total number of days together since the start date.
 */
export function calculateDaysTogether(togetherSince: string): number | null {
  if (!togetherSince) return null;
  const start = new Date(togetherSince).getTime();
  if (isNaN(start)) return null;

  const now = Date.now();
  if (start > now) return 1;

  const diffMs = now - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

/**
 * Converts a DisappearingTimer option to an ISO expiry timestamp string.
 */
export function getExpiryTimestamp(timer: DisappearingTimer): string | null {
  const now = Date.now();
  switch (timer) {
    case "1h":
      return new Date(now + 60 * 60 * 1000).toISOString();
    case "1d":
      return new Date(now + 24 * 60 * 60 * 1000).toISOString();
    case "1w":
      return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    case "off":
    default:
      return null;
  }
}

/**
 * Loads and decrypts room settings from localStorage.
 */
export async function loadEncryptedSettings(
  roomId: string,
  encKey: Uint8Array
): Promise<RoomSettings> {
  if (typeof window === "undefined") return DEFAULT_ROOM_SETTINGS;

  const storageKey = `olr_room_settings_${roomId}`;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return DEFAULT_ROOM_SETTINGS;

  try {
    const encryptedPkg = JSON.parse(raw);
    const decrypted = await decryptPayload<RoomSettings>(encryptedPkg, encKey);
    return { ...DEFAULT_ROOM_SETTINGS, ...decrypted };
  } catch {
    return DEFAULT_ROOM_SETTINGS;
  }
}

/**
 * Encrypts and saves room settings into localStorage.
 */
export async function saveEncryptedSettings(
  roomId: string,
  settings: RoomSettings,
  encKey: Uint8Array
): Promise<void> {
  if (typeof window === "undefined") return;

  const storageKey = `olr_room_settings_${roomId}`;
  const encryptedPkg = await encryptPayload(settings, encKey);
  localStorage.setItem(storageKey, JSON.stringify(encryptedPkg));
}
