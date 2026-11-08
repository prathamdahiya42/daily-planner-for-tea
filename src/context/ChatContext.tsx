"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRoom } from "./RoomContext";
import {
  DecryptedMessage,
  EncryptedMessageRecord,
  PlaintextMessagePayload,
  PhotoMetadata,
} from "@/lib/chat/types";
import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";
import { compressImage } from "@/lib/media/compress";
import { encryptMediaBlob, decryptMediaBlob } from "@/lib/media/photo-crypto";
import {
  RoomSettings,
  DEFAULT_ROOM_SETTINGS,
  loadEncryptedSettings,
  saveEncryptedSettings,
  getExpiryTimestamp,
} from "@/lib/settings/room-settings";
import { resolveSticker } from "@/lib/stickers/resolver";
import { APP_CONFIG } from "@/config/app.config";

interface ChatContextType {
  messages: DecryptedMessage[];
  isLoadingMessages: boolean;
  isPartnerTyping: boolean;
  isPartnerOnline: boolean;
  roomSettings: RoomSettings;
  replyingTo: DecryptedMessage | null;
  setReplyingTo: (msg: DecryptedMessage | null) => void;
  sendMessage: (text: string) => Promise<{ success: boolean; error?: string }>;
  sendSticker: (stickerId: string) => Promise<{ success: boolean; error?: string }>;
  sendPhoto: (file: File) => Promise<{ success: boolean; error?: string }>;
  sendCodedSignal: (signalIndex: number) => Promise<{ success: boolean; suppressed?: boolean; error?: string }>;
  fetchAndDecryptPhoto: (fileId: string, photoIv: string, mimeType?: string) => Promise<string | null>;
  editMessage: (messageId: string, newText: string) => Promise<{ success: boolean; error?: string }>;
  unsendMessage: (messageId: string) => Promise<{ success: boolean; error?: string }>;
  toggleHeartReaction: (messageId: string) => Promise<{ success: boolean; error?: string }>;
  toggleStickerReaction: (messageId: string, stickerId: string) => Promise<{ success: boolean; error?: string }>;
  markMessageSeen: (messageId: string) => Promise<void>;
  broadcastTyping: (isTyping: boolean) => void;
  updateRoomSettings: (newSettings: Partial<RoomSettings>) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isUnlocked, roomId, deviceId, encKey, sessionToken } = useRoom();

  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [replyingTo, setReplyingTo] = useState<DecryptedMessage | null>(null);
  const [roomSettings, setRoomSettings] = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS);

  const lastTypingSentRef = useRef<number>(0);
  const seenCacheRef = useRef<Set<string>>(new Set());
  const photoCacheRef = useRef<Map<string, string>>(new Map()); // fileId -> objectURL

  // Load encrypted settings on room unlock
  useEffect(() => {
    if (isUnlocked && roomId && encKey) {
      loadEncryptedSettings(roomId, encKey).then(setRoomSettings);
    } else {
      setRoomSettings(DEFAULT_ROOM_SETTINGS);
    }
  }, [isUnlocked, roomId, encKey]);

  // Clean up cached photo Object URLs on room lock
  useEffect(() => {
    if (!isUnlocked) {
      for (const url of photoCacheRef.current.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      photoCacheRef.current.clear();
    }
  }, [isUnlocked]);

  // Update room settings and persist encrypted to local storage
  const updateRoomSettings = useCallback(
    async (newSettings: Partial<RoomSettings>) => {
      if (!roomId || !encKey) return;
      const updated = { ...roomSettings, ...newSettings };
      setRoomSettings(updated);
      await saveEncryptedSettings(roomId, updated, encKey);
    },
    [roomId, encKey, roomSettings]
  );

  // Presence heartbeat loop
  useEffect(() => {
    if (!isUnlocked || !sessionToken) {
      setIsPartnerOnline(false);
      return;
    }

    const checkPresence = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsPartnerOnline(Boolean(data.isPartnerOnline));
        }
      } catch {}
    };

    checkPresence();
    const presenceInterval = setInterval(checkPresence, 12000);
    return () => clearInterval(presenceInterval);
  }, [isUnlocked, sessionToken]);

  // Helper to decrypt an encrypted message record
  const decryptRecord = useCallback(
    async (record: EncryptedMessageRecord): Promise<DecryptedMessage> => {
      if (!encKey) {
        return {
          ...record,
          payload: { text: "[Encrypted content]" },
          decryptedSuccessfully: false,
        };
      }

      try {
        const payload = await decryptPayload<PlaintextMessagePayload>(
          { ciphertext: record.ciphertext, iv: record.iv },
          encKey
        );
        return {
          ...record,
          payload,
          decryptedSuccessfully: true,
        };
      } catch (err) {
        return {
          ...record,
          payload: { text: "[Decryption failed]" },
          decryptedSuccessfully: false,
        };
      }
    },
    [encKey]
  );

  // Fetch and decrypt message history
  const refreshMessages = useCallback(async () => {
    if (!isUnlocked || !sessionToken || !encKey) return;

    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const records = (data.messages || []) as EncryptedMessageRecord[];

      const now = Date.now();
      const nonExpiredRecords = records.filter(
        (r) => !r.expires_at || new Date(r.expires_at).getTime() > now
      );

      const decryptedList = await Promise.all(nonExpiredRecords.map(decryptRecord));
      setMessages(decryptedList);
    } catch {
      // Ignore network drop
    }
  }, [isUnlocked, sessionToken, encKey, decryptRecord]);

  // Initial load and sync loop
  useEffect(() => {
    if (isUnlocked && sessionToken && encKey) {
      setIsLoadingMessages(true);
      refreshMessages().finally(() => setIsLoadingMessages(false));

      const syncInterval = setInterval(refreshMessages, 3000);
      return () => clearInterval(syncInterval);
    } else {
      setMessages([]);
      setIsPartnerTyping(false);
      setReplyingTo(null);
    }
  }, [isUnlocked, sessionToken, encKey, refreshMessages]);

  // Disappearing messages local pruning timer (every 4 seconds)
  useEffect(() => {
    if (!isUnlocked) return;

    const pruneTimer = setInterval(() => {
      const now = Date.now();
      setMessages((prev) =>
        prev.filter((m) => !m.expires_at || new Date(m.expires_at).getTime() > now)
      );
    }, 4000);

    return () => clearInterval(pruneTimer);
  }, [isUnlocked]);

  // Fetch, download and decrypt an encrypted photo
  const fetchAndDecryptPhoto = useCallback(
    async (fileId: string, photoIv: string, mimeType = "image/jpeg"): Promise<string | null> => {
      if (!roomId || !sessionToken || !encKey) return null;

      if (photoCacheRef.current.has(fileId)) {
        return photoCacheRef.current.get(fileId)!;
      }

      try {
        const res = await fetch(`/api/media/${roomId}/${fileId}`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });

        if (!res.ok) return null;

        const encryptedBytes = await res.arrayBuffer();
        const decryptedBlob = await decryptMediaBlob(
          encryptedBytes,
          photoIv,
          encKey,
          mimeType
        );

        const objectUrl = URL.createObjectURL(decryptedBlob);
        photoCacheRef.current.set(fileId, objectUrl);
        return objectUrl;
      } catch {
        return null;
      }
    },
    [roomId, sessionToken, encKey]
  );

  // Send an encrypted text message
  const sendMessage = useCallback(
    async (text: string): Promise<{ success: boolean; error?: string }> => {
      const trimmed = text.trim();
      if (!trimmed || !encKey || !sessionToken || !deviceId || !roomId) {
        return { success: false, error: "Cannot send message: missing session or keys" };
      }

      const messageId = crypto.randomUUID();
      const expiresAt = getExpiryTimestamp(roomSettings.disappearingTimer);

      const payload: PlaintextMessagePayload = {
        text: trimmed,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              senderDeviceId: replyingTo.sender_device_id,
              snippet: replyingTo.payload.text.slice(0, 60),
            }
          : undefined,
        reactions: {},
        seenBy: { [deviceId]: Date.now() },
      };

      try {
        const encrypted = await encryptPayload(payload, encKey);

        const newRecord: DecryptedMessage = {
          id: messageId,
          room_id: roomId,
          sender_device_id: deviceId,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          type: "text",
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          payload,
          decryptedSuccessfully: true,
        };

        setMessages((prev) => [...prev, newRecord]);
        setReplyingTo(null);

        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            id: messageId,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            type: "text",
            expiresAt,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err.error || "Failed to send message" };
        }

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Encryption error",
        };
      }
    },
    [encKey, sessionToken, deviceId, roomId, replyingTo, roomSettings.disappearingTimer]
  );

  // Send an encrypted sticker
  const sendSticker = useCallback(
    async (stickerId: string): Promise<{ success: boolean; error?: string }> => {
      if (!encKey || !sessionToken || !deviceId || !roomId) {
        return { success: false, error: "Cannot send sticker: missing session or keys" };
      }

      const messageId = crypto.randomUUID();
      const expiresAt = getExpiryTimestamp(roomSettings.disappearingTimer);
      const resolved = resolveSticker(stickerId);

      const payload: PlaintextMessagePayload = {
        text: "",
        stickerId: resolved.id,
        stickerFile: resolved.file,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              senderDeviceId: replyingTo.sender_device_id,
              snippet: replyingTo.payload.text || "Sticker",
            }
          : undefined,
        reactions: {},
        stickerReactions: {},
        seenBy: { [deviceId]: Date.now() },
      };

      try {
        const encrypted = await encryptPayload(payload, encKey);

        const newRecord: DecryptedMessage = {
          id: messageId,
          room_id: roomId,
          sender_device_id: deviceId,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          type: "sticker",
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          payload,
          decryptedSuccessfully: true,
        };

        setMessages((prev) => [...prev, newRecord]);
        setReplyingTo(null);

        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            id: messageId,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            type: "sticker",
            expiresAt,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err.error || "Failed to send sticker" };
        }

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Encryption error",
        };
      }
    },
    [encKey, sessionToken, deviceId, roomId, replyingTo, roomSettings.disappearingTimer]
  );

  // Send a compressed, client-encrypted photo
  const sendPhoto = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string }> => {
      if (!encKey || !sessionToken || !deviceId || !roomId) {
        return { success: false, error: "Cannot send photo: missing session or keys" };
      }

      try {
        // 1. Compress image to ~200KB before encryption
        const compressed = await compressImage(file, 200 * 1024);

        // 2. Encrypt compressed binary blob client-side with AES-256-GCM
        const encryptedMedia = await encryptMediaBlob(compressed.blob, encKey);
        const fileId = crypto.randomUUID();

        // 3. Upload encrypted binary blob to private storage
        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/octet-stream",
            "x-file-id": fileId,
            "x-mime-type": "image/jpeg",
          },
          body: encryptedMedia.encryptedBlob,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          return { success: false, error: err.error || "Failed to upload encrypted photo" };
        }

        // Cache local object URL for instant smooth preview
        const localPreviewUrl = URL.createObjectURL(compressed.blob);
        photoCacheRef.current.set(fileId, localPreviewUrl);

        // 4. Create encrypted message record
        const messageId = crypto.randomUUID();
        const expiresAt = getExpiryTimestamp(roomSettings.disappearingTimer);

        const photoMeta: PhotoMetadata = {
          fileId,
          photoIv: encryptedMedia.ivBase64,
          width: compressed.width,
          height: compressed.height,
          size: compressed.compressedSize,
          mimeType: "image/jpeg",
          localUrl: localPreviewUrl,
        };

        const payload: PlaintextMessagePayload = {
          text: "Photo",
          photo: photoMeta,
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                senderDeviceId: replyingTo.sender_device_id,
                snippet: "Photo",
              }
            : undefined,
          reactions: {},
          seenBy: { [deviceId]: Date.now() },
        };

        const encrypted = await encryptPayload(payload, encKey);

        const newRecord: DecryptedMessage = {
          id: messageId,
          room_id: roomId,
          sender_device_id: deviceId,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          type: "photo",
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
          payload,
          decryptedSuccessfully: true,
        };

        setMessages((prev) => [...prev, newRecord]);
        setReplyingTo(null);

        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            id: messageId,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            type: "photo",
            expiresAt,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err.error || "Failed to post photo message" };
        }

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to encrypt and send photo",
        };
      }
    },
    [encKey, sessionToken, deviceId, roomId, replyingTo, roomSettings.disappearingTimer]
  );

  // Edit an existing message
  const editMessage = useCallback(
    async (messageId: string, newText: string): Promise<{ success: boolean; error?: string }> => {
      const trimmed = newText.trim();
      if (!trimmed || !encKey || !sessionToken || !deviceId || !roomId) {
        return { success: false, error: "Cannot edit message" };
      }

      const target = messages.find((m) => m.id === messageId);
      if (!target || target.sender_device_id !== deviceId) {
        return { success: false, error: "Only your own messages can be edited" };
      }

      const updatedPayload: PlaintextMessagePayload = {
        ...target.payload,
        text: trimmed,
        editedAt: Date.now(),
      };

      try {
        const encrypted = await encryptPayload(updatedPayload, encKey);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  ciphertext: encrypted.ciphertext,
                  iv: encrypted.iv,
                  payload: updatedPayload,
                }
              : m
          )
        );

        const res = await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err.error || "Failed to save edit" };
        }

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Encryption error",
        };
      }
    },
    [messages, encKey, sessionToken, deviceId, roomId]
  );

  // Unsend a message
  const unsendMessage = useCallback(
    async (messageId: string): Promise<{ success: boolean; error?: string }> => {
      if (!encKey || !sessionToken || !deviceId) {
        return { success: false, error: "Cannot unsend message" };
      }

      const target = messages.find((m) => m.id === messageId);
      if (!target || target.sender_device_id !== deviceId) {
        return { success: false, error: "Only your own messages can be unsent" };
      }

      const unsentPayload: PlaintextMessagePayload = {
        text: "",
        isUnsent: true,
      };

      try {
        const encrypted = await encryptPayload(unsentPayload, encKey);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  ciphertext: encrypted.ciphertext,
                  iv: encrypted.iv,
                  payload: unsentPayload,
                }
              : m
          )
        );

        const res = await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err.error || "Failed to unsend message" };
        }

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Encryption error",
        };
      }
    },
    [messages, encKey, sessionToken, deviceId]
  );

  // Toggle heart reaction on message
  const toggleHeartReaction = useCallback(
    async (messageId: string): Promise<{ success: boolean; error?: string }> => {
      if (!encKey || !sessionToken || !deviceId) {
        return { success: false, error: "Cannot react" };
      }

      const target = messages.find((m) => m.id === messageId);
      if (!target) return { success: false, error: "Message not found" };

      const reactions = { ...(target.payload.reactions || {}) };
      if (reactions[deviceId]) {
        delete reactions[deviceId];
      } else {
        reactions[deviceId] = "❤️";
      }

      const updatedPayload: PlaintextMessagePayload = {
        ...target.payload,
        reactions,
      };

      try {
        const encrypted = await encryptPayload(updatedPayload, encKey);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  ciphertext: encrypted.ciphertext,
                  iv: encrypted.iv,
                  payload: updatedPayload,
                }
              : m
          )
        );

        await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
          }),
        });

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Reaction failed",
        };
      }
    },
    [messages, encKey, sessionToken, deviceId]
  );

  // Toggle sticker reaction on message
  const toggleStickerReaction = useCallback(
    async (messageId: string, stickerId: string): Promise<{ success: boolean; error?: string }> => {
      if (!encKey || !sessionToken || !deviceId) {
        return { success: false, error: "Cannot react" };
      }

      const target = messages.find((m) => m.id === messageId);
      if (!target) return { success: false, error: "Message not found" };

      const stickerReactions = { ...(target.payload.stickerReactions || {}) };
      if (stickerReactions[deviceId] === stickerId) {
        delete stickerReactions[deviceId];
      } else {
        stickerReactions[deviceId] = stickerId;
      }

      const updatedPayload: PlaintextMessagePayload = {
        ...target.payload,
        stickerReactions,
      };

      try {
        const encrypted = await encryptPayload(updatedPayload, encKey);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  ciphertext: encrypted.ciphertext,
                  iv: encrypted.iv,
                  payload: updatedPayload,
                }
              : m
          )
        );

        await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
          }),
        });

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Sticker reaction failed",
        };
      }
    },
    [messages, encKey, sessionToken, deviceId]
  );

  // Mark partner's message as seen
  const markMessageSeen = useCallback(
    async (messageId: string) => {
      if (!encKey || !sessionToken || !deviceId) return;
      if (seenCacheRef.current.has(messageId)) return;

      const target = messages.find((m) => m.id === messageId);
      if (!target || target.sender_device_id === deviceId) return;

      const seenBy = target.payload.seenBy || {};
      if (seenBy[deviceId]) {
        seenCacheRef.current.add(messageId);
        return;
      }

      seenCacheRef.current.add(messageId);
      const updatedPayload: PlaintextMessagePayload = {
        ...target.payload,
        seenBy: { ...seenBy, [deviceId]: Date.now() },
      };

      try {
        const encrypted = await encryptPayload(updatedPayload, encKey);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  ciphertext: encrypted.ciphertext,
                  iv: encrypted.iv,
                  payload: updatedPayload,
                }
              : m
          )
        );

        await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
          }),
        });
      } catch {
        // Silently skip
      }
    },
    [messages, encKey, sessionToken, deviceId]
  );

  // Send a Coded Signal (Index 0-5)
  const sendCodedSignal = useCallback(
    async (signalIndex: number): Promise<{ success: boolean; suppressed?: boolean; error?: string }> => {
      if (!encKey || !sessionToken || !deviceId || !roomId) {
        return { success: false, error: "Cannot send signal: missing session or keys" };
      }

      try {
        // 1. Dispatch push to partner's device with NO secret text (only { signalIndex })
        const pushRes = await fetch("/api/signals/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            signalIndex,
            quietHours: {
              enabled: roomSettings.quietHoursEnabled,
              start: roomSettings.quietHoursStart,
              end: roomSettings.quietHoursEnd,
            },
          }),
        });

        const pushData = await pushRes.json();
        if (pushData.suppressed) {
          return { success: true, suppressed: true };
        }

        // 2. Insert encrypted signal message into chat stream
        const messageId = crypto.randomUUID();
        const secretLabel =
          roomSettings.customSignalLabels?.[signalIndex] ||
          APP_CONFIG.codedSignals[signalIndex]?.defaultSecretLabel ||
          "Coded Signal";

        const payload: PlaintextMessagePayload = {
          text: secretLabel,
          extra: { signalIndex },
          seenBy: { [deviceId]: Date.now() },
        };

        const encrypted = await encryptPayload(payload, encKey);
        const newRecord: DecryptedMessage = {
          id: messageId,
          room_id: roomId,
          sender_device_id: deviceId,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          type: "signal",
          created_at: new Date().toISOString(),
          payload,
          decryptedSuccessfully: true,
        };

        setMessages((prev) => [...prev, newRecord]);

        await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            id: messageId,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            type: "signal",
          }),
        });

        return { success: true };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to dispatch coded signal",
        };
      }
    },
    [encKey, sessionToken, deviceId, roomId, roomSettings]
  );

  // Auto "I'm online" signal on unlock (max once per hour)
  const autoOnlineSentRef = useRef<boolean>(false);
  useEffect(() => {
    if (isUnlocked && roomSettings.autoOnlineSignal && !autoOnlineSentRef.current) {
      const LAST_ONLINE_KEY = "olr_last_auto_online_timestamp";
      const lastStr = typeof window !== "undefined" ? localStorage.getItem(LAST_ONLINE_KEY) : null;
      const lastTime = lastStr ? parseInt(lastStr, 10) : 0;
      const oneHour = 60 * 60 * 1000;

      if (Date.now() - lastTime > oneHour) {
        autoOnlineSentRef.current = true;
        localStorage.setItem(LAST_ONLINE_KEY, Date.now().toString());
        sendCodedSignal(1); // Slot 1: "I'm online / Here now ✨"
      }
    }
  }, [isUnlocked, roomSettings.autoOnlineSignal, sendCodedSignal]);

  // Broadcast typing indicator
  const broadcastTyping = useCallback((isTyping: boolean) => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1200) return;
    lastTypingSentRef.current = now;
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoadingMessages,
        isPartnerTyping,
        isPartnerOnline,
        roomSettings,
        replyingTo,
        setReplyingTo,
        sendMessage,
        sendSticker,
        sendPhoto,
        sendCodedSignal,
        fetchAndDecryptPhoto,
        editMessage,
        unsendMessage,
        toggleHeartReaction,
        toggleStickerReaction,
        markMessageSeen,
        broadcastTyping,
        updateRoomSettings,
        refreshMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
