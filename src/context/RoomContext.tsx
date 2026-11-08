"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { deriveCredentialsFromPassphrase } from "@/lib/crypto/kdf";
import { bytesToBase64, base64ToBytes } from "@/lib/crypto/utils";

export interface PendingDevice {
  id: string;
  created_at: string;
}

interface RoomContextType {
  isUnlocked: boolean;
  isPaired: boolean;
  isPendingApproval: boolean;
  roomId: string | null;
  deviceId: string | null;
  nickname: string;
  encKey: Uint8Array | null;
  sessionToken: string | null;
  remainingPinAttempts: number;
  pendingDeviceRequests: PendingDevice[];
  enterRoomWithPassword: (
    password: string,
    nickname: string,
    remember: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  exitRoomAndWipe: () => void;
  // Legacy / fallback hooks to avoid breaking any callers
  unlockWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  setupRoomWithPassphrase: (
    passphrase: string,
    pin: string
  ) => Promise<{ success: boolean; error?: string }>;
  approvePendingDevice: (
    pendingDeviceId: string,
    pin: string
  ) => Promise<{ success: boolean; error?: string }>;
  lockRoom: () => void;
  quickHide: () => void;
  resetDevice: () => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

const STORAGE_KEY = "olr_session_v2";

interface StoredSession {
  roomId: string;
  deviceId: string;
  nickname: string;
  sessionToken: string;
  encKeyBase64: string;
}

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("Him");
  const [encKey, setEncKey] = useState<Uint8Array | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Check stored session on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Check sessionStorage first, then localStorage
      const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session: StoredSession = JSON.parse(raw);
        if (session.roomId && session.sessionToken && session.encKeyBase64) {
          setRoomId(session.roomId);
          setDeviceId(session.deviceId);
          setNickname(session.nickname || "Love");
          setSessionToken(session.sessionToken);
          setEncKey(base64ToBytes(session.encKeyBase64));
          setIsUnlocked(true);
        }
      }
    } catch (e) {
      console.warn("Failed to restore session:", e);
    }
  }, []);

  // Enter room with secret password
  const enterRoomWithPassword = useCallback(
    async (
      password: string,
      chosenNickname: string,
      remember: boolean
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!password.trim()) {
          return { success: false, error: "Please enter a password." };
        }

        // 1. Deterministically derive Room credentials and AES-256 key from password
        const derived = await deriveCredentialsFromPassphrase(password.trim());
        const derivedRoomId = derived.roomId;
        const derivedEncKey = derived.encKey;
        const derivedVerifier = derived.authVerifier;

        // 2. Generate or retrieve a persistent device ID
        let currentDeviceId = deviceId;
        if (!currentDeviceId) {
          currentDeviceId = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
        }

        // 3. Authenticate with server
        const res = await fetch("/api/room/enter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: derivedRoomId,
            authVerifier: derivedVerifier,
            deviceId: currentDeviceId,
            nickname: chosenNickname || "Love",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || "Failed to enter room" };
        }

        // 4. Update in-memory state
        setRoomId(derivedRoomId);
        setDeviceId(currentDeviceId);
        setNickname(chosenNickname || "Love");
        setEncKey(derivedEncKey);
        setSessionToken(data.token);
        setIsUnlocked(true);

        // 5. Store session for persistence
        const sessionData: StoredSession = {
          roomId: derivedRoomId,
          deviceId: currentDeviceId,
          nickname: chosenNickname || "Love",
          sessionToken: data.token,
          encKeyBase64: bytesToBase64(derivedEncKey),
        };

        if (remember) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        }

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error unlocking room",
        };
      }
    },
    [deviceId]
  );

  // Complete Privacy Wipe on Exit / Log out
  const exitRoomAndWipe = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    setEncKey(null);
    setSessionToken(null);
    setIsUnlocked(false);
    setRoomId(null);
    setDeviceId(null);
    setNickname("Him");
  }, []);

  const lockRoom = useCallback(() => {
    exitRoomAndWipe();
  }, [exitRoomAndWipe]);

  const quickHide = useCallback(() => {
    exitRoomAndWipe();
  }, [exitRoomAndWipe]);

  const resetDevice = useCallback(() => {
    exitRoomAndWipe();
  }, [exitRoomAndWipe]);

  // Legacy stubs to ensure full backwards compatibility
  const unlockWithPin = useCallback(
    async (pin: string) => {
      return enterRoomWithPassword(pin, "Him", true);
    },
    [enterRoomWithPassword]
  );

  const setupRoomWithPassphrase = useCallback(
    async (passphrase: string) => {
      return enterRoomWithPassword(passphrase, "Him", true);
    },
    [enterRoomWithPassword]
  );

  const approvePendingDevice = useCallback(async () => {
    return { success: true };
  }, []);

  return (
    <RoomContext.Provider
      value={{
        isUnlocked,
        isPaired: isUnlocked,
        isPendingApproval: false,
        roomId,
        deviceId,
        nickname,
        encKey,
        sessionToken,
        remainingPinAttempts: 5,
        pendingDeviceRequests: [],
        enterRoomWithPassword,
        exitRoomAndWipe,
        unlockWithPin,
        setupRoomWithPassphrase,
        approvePendingDevice,
        lockRoom,
        quickHide,
        resetDevice,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}
