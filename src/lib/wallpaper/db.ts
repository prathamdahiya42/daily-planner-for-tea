import { createStore, get, set, del, clear } from "idb-keyval";
import { WallpaperRecord } from "./types";

// Neutral database name per Hard Rule 2
const DB_NAME = "dp_media";
const STORE_NAME = "wallpapers";
const ACTIVE_KEY = "active_wallpaper";

let customStore: ReturnType<typeof createStore> | null = null;

function getStore() {
  if (typeof window === "undefined") return null;
  if (!customStore) {
    customStore = createStore(DB_NAME, STORE_NAME);
  }
  return customStore;
}

export async function getActiveWallpaper(): Promise<WallpaperRecord | null> {
  const store = getStore();
  if (!store) return null;
  try {
    const val = await get<WallpaperRecord>(ACTIVE_KEY, store);
    return val || null;
  } catch (err) {
    console.error("[WallpaperDB] Error getting wallpaper:", err);
    return null;
  }
}

export async function saveActiveWallpaper(record: WallpaperRecord): Promise<void> {
  const store = getStore();
  if (!store) return;
  try {
    await set(ACTIVE_KEY, record, store);
  } catch (err) {
    console.error("[WallpaperDB] Error saving wallpaper:", err);
  }
}

export async function clearActiveWallpaper(): Promise<void> {
  const store = getStore();
  if (!store) return;
  try {
    await del(ACTIVE_KEY, store);
  } catch (err) {
    console.error("[WallpaperDB] Error clearing wallpaper:", err);
  }
}

export async function wipeAllMedia(): Promise<void> {
  const store = getStore();
  if (!store) return;
  try {
    await clear(store);
  } catch (err) {
    console.error("[WallpaperDB] Error wiping media DB:", err);
  }
}
