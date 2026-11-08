"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { StickerPicker } from "@/components/stickers/StickerPicker";
import { AppearanceModal } from "@/components/chat/AppearanceModal";
import { WallpaperModal } from "@/components/chat/WallpaperModal";
import { WallpaperLayer } from "@/components/chat/WallpaperLayer";
import { DecryptedMessage } from "@/lib/chat/types";
import { applyThemeToElement } from "@/lib/theme/storage";
import { StyleType, ModeType, UserThemePrefs } from "@/lib/theme/types";
import { WallpaperRecord } from "@/lib/wallpaper/types";

const MOCK_MESSAGES: DecryptedMessage[] = [
  {
    id: "msg-1",
    room_id: "test-room",
    sender_device_id: "partner-device",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    type: "text",
    ciphertext: "",
    iv: "",
    decryptedSuccessfully: true,
    payload: {
      text: "good morning my love ☕ drink your tea!",
      seenBy: { "my-device": Date.now() },
    },
  },
  {
    id: "msg-2",
    room_id: "test-room",
    sender_device_id: "my-device",
    created_at: new Date(Date.now() - 3000000).toISOString(),
    type: "text",
    ciphertext: "",
    iv: "",
    decryptedSuccessfully: true,
    payload: {
      text: "good morning sweetheart! on my way now 💕",
      seenBy: { "partner-device": Date.now() },
    },
  },
  {
    id: "msg-3",
    room_id: "test-room",
    sender_device_id: "partner-device",
    created_at: new Date(Date.now() - 2400000).toISOString(),
    type: "sticker",
    ciphertext: "",
    iv: "",
    decryptedSuccessfully: true,
    payload: {
      text: "",
      stickerId: "noto-bear",
      stickerFile: "/stickers/noto/bear.svg",
      seenBy: { "my-device": Date.now() },
      reactions: { "my-device": "❤️" },
    },
  },
  {
    id: "msg-4",
    room_id: "test-room",
    sender_device_id: "my-device",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    type: "sticker",
    ciphertext: "",
    iv: "",
    decryptedSuccessfully: true,
    payload: {
      text: "",
      stickerId: "caption-miss-you",
      stickerFile: "/stickers/captions/caption-miss-you.svg",
      seenBy: { "partner-device": Date.now() },
    },
  },
  {
    id: "msg-5",
    room_id: "test-room",
    sender_device_id: "partner-device",
    created_at: new Date(Date.now() - 600000).toISOString(),
    type: "signal",
    ciphertext: "",
    iv: "",
    decryptedSuccessfully: true,
    payload: {
      text: "Thinking of you",
      extra: { signalIndex: 0 },
      seenBy: { "my-device": Date.now() },
    },
  },
];

interface GalleryPageProps {
  searchParams: Promise<{ view?: string; accent?: string }>;
}

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  const resolvedParams = use(searchParams);
  const view = resolvedParams.view || "cozy-light";
  const customAccent = resolvedParams.accent || "#D12E53";

  const chatRootRef = useRef<HTMLDivElement>(null);

  // Map view to theme settings
  let style: StyleType = "cozy";
  let mode: ModeType = "light";
  let showStickers = false;
  let showAppearance = false;
  let showWallpaper = false;
  let activeWallpaper: WallpaperRecord | null = null;

  if (view === "cozy-dark") {
    style = "cozy";
    mode = "dark";
  } else if (view === "glow-dark") {
    style = "glow";
    mode = "dark";
  } else if (view === "glow-light") {
    style = "glow";
    mode = "light";
  } else if (view === "paper-light") {
    style = "paper";
    mode = "light";
  } else if (view === "paper-dark") {
    style = "paper";
    mode = "dark";
  } else if (view === "stickers") {
    style = "cozy";
    mode = "dark";
    showStickers = true;
  } else if (view === "appearance") {
    style = "cozy";
    mode = "dark";
    showAppearance = true;
  } else if (view === "wallpaper") {
    style = "cozy";
    mode = "dark";
    showWallpaper = true;
  } else if (view === "wallpaper-active") {
    style = "cozy";
    mode = "dark";
    activeWallpaper = {
      id: "preset-romantic-dawn",
      type: "preset",
      presetId: "romantic-dawn",
      blur: 0,
      dim: 0.15,
      createdAt: Date.now(),
    };
  }

  const prefs: UserThemePrefs = {
    style,
    mode,
    accent: customAccent,
  };

  useEffect(() => {
    applyThemeToElement(chatRootRef.current, prefs);
  }, [style, mode, customAccent]);

  return (
    <div
      ref={chatRootRef}
      className="w-full max-w-[390px] mx-auto h-[844px] max-h-[844px] overflow-hidden room-chat-pattern flex flex-col font-body select-none relative"
      style={{ minHeight: "844px" }}
    >
      <WallpaperLayer wallpaper={activeWallpaper} />

      <ChatHeader
        onOpenSettings={() => {}}
        onOpenAppearance={() => {}}
        onOpenWallpaper={() => {}}
        isScrolled={false}
      />

      <main className="flex-1 px-3 py-2 overflow-y-auto flex flex-col justify-end relative z-10">
        <div className="flex justify-center my-2">
          <span className="px-3 py-0.5 rounded-full font-display italic text-[11px] bg-surface/95 border border-blush/80 text-plum shadow-xs">
            Today
          </span>
        </div>

        {MOCK_MESSAGES.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={msg.sender_device_id === "my-device"}
            isLastInGroup={true}
            onReply={() => {}}
            onEdit={() => {}}
            onUnsend={() => {}}
            onToggleHeart={() => {}}
            onVisible={() => {}}
          />
        ))}
      </main>

      <ChatInput
        onSendMessage={async () => ({ success: true })}
        onOpenStickers={() => {}}
        onOpenSignals={() => {}}
        onSendPhoto={async () => ({ success: true })}
        replyingTo={null}
        onCancelReply={() => {}}
        editingMessage={null}
        onCancelEdit={() => {}}
        onSaveEdit={async () => ({ success: true })}
        onTyping={() => {}}
      />

      {showStickers && (
        <StickerPicker onSelectSticker={() => {}} onClose={() => {}} />
      )}

      {showAppearance && (
        <AppearanceModal
          prefs={prefs}
          onSavePrefs={() => {}}
          onClose={() => {}}
        />
      )}

      {showWallpaper && (
        <WallpaperModal
          currentWallpaper={activeWallpaper}
          onSave={async () => {}}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
