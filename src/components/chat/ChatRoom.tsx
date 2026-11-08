"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRoom } from "@/context/RoomContext";
import { useChat } from "@/context/ChatContext";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { StickerPicker } from "@/components/stickers/StickerPicker";
import { RoomSettingsModal } from "./RoomSettingsModal";
import { CodedSignalDrawer } from "@/components/signals/CodedSignalDrawer";
import { DecryptedMessage } from "@/lib/chat/types";
import { BACKGROUND_THEMES } from "@/lib/settings/room-settings";
import { Sparkles } from "lucide-react";

export function ChatRoom() {
  const { deviceId, roomId, quickHide } = useRoom();
  const {
    messages,
    isLoadingMessages,
    isPartnerTyping,
    roomSettings,
    replyingTo,
    setReplyingTo,
    sendMessage,
    sendSticker,
    sendPhoto,
    sendCodedSignal,
    editMessage,
    unsendMessage,
    toggleHeartReaction,
    toggleStickerReaction,
    markMessageSeen,
    broadcastTyping,
    updateRoomSettings,
  } = useChat();

  const [editingMessage, setEditingMessage] = useState<DecryptedMessage | null>(null);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [showSignalDrawer, setShowSignalDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  // Hook shake detection for quick-hide
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 150) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const delta =
          Math.abs((current.x || 0) + (current.y || 0) + (current.z || 0) - lastX - lastY - lastZ);
        const speed = (delta / diffTime) * 10000;

        if (speed > 800) {
          quickHide();
        }

        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    if (typeof window !== "undefined" && "ondevicemotion" in window) {
      window.addEventListener("devicemotion", handleMotion);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("devicemotion", handleMotion);
      }
    };
  }, [quickHide]);

  // Triple-tap quick hide gesture anywhere on background
  const tripleTapCountRef = useRef<number>(0);
  const tripleTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("form") || target.closest("footer")) {
      return;
    }

    tripleTapCountRef.current += 1;
    if (tripleTapTimerRef.current) clearTimeout(tripleTapTimerRef.current);

    if (tripleTapCountRef.current >= 3) {
      tripleTapCountRef.current = 0;
      quickHide();
    } else {
      tripleTapTimerRef.current = setTimeout(() => {
        tripleTapCountRef.current = 0;
      }, 550);
    }
  };

  // Dynamic background style based on room settings
  const currentTheme =
    BACKGROUND_THEMES[roomSettings.backgroundTheme] || BACKGROUND_THEMES["warm-rose"];

  return (
    <div
      onClick={handleBackgroundClick}
      className={`w-full max-w-[420px] mx-auto min-h-screen ${currentTheme.bgClass} flex flex-col font-sans select-none transition-colors duration-500 relative`}
    >
      {/* Top Header */}
      <ChatHeader onOpenSettings={() => setShowSettingsModal(true)} />

      {/* Message Stream */}
      <main className="flex-1 p-4 overflow-y-auto flex flex-col justify-end">
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 gap-2 py-20">
            <Sparkles className="w-4 h-4 animate-spin text-rose-400" />
            <span>Decrypting messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mb-3 shadow-soft">
              🧸
            </div>
            <h3 className="text-sm font-bold text-slate-800">Your Private Space</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              Every message, photo, sticker, and signal is end-to-end encrypted. Send your first note!
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.sender_device_id === deviceId}
                onReply={(m) => setReplyingTo(m)}
                onEdit={(m) => setEditingMessage(m)}
                onUnsend={(m) => unsendMessage(m.id)}
                onToggleHeart={(id) => toggleHeartReaction(id)}
                onToggleStickerReaction={(msgId, stId) => toggleStickerReaction(msgId, stId)}
                onVisible={(id) => markMessageSeen(id)}
              />
            ))}
          </div>
        )}

        {/* Partner Typing Indicator */}
        {isPartnerTyping && (
          <div className="flex items-center gap-2 text-xs text-rose-400 italic my-2 ml-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>partner is typing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input Bar */}
      <ChatInput
        onSendMessage={sendMessage}
        onOpenStickers={() => setShowStickerDrawer(true)}
        onOpenSignals={() => setShowSignalDrawer(true)}
        onSendPhoto={sendPhoto}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onSaveEdit={editMessage}
        onTyping={broadcastTyping}
      />

      {/* Sticker Drawer */}
      {showStickerDrawer && (
        <StickerPicker
          onSelectSticker={(stickerId) => {
            setShowStickerDrawer(false);
            sendSticker(stickerId);
          }}
          onClose={() => setShowStickerDrawer(false)}
        />
      )}

      {/* Coded Signals Drawer */}
      {showSignalDrawer && (
        <CodedSignalDrawer
          roomSettings={roomSettings}
          onSendSignal={sendCodedSignal}
          onClose={() => setShowSignalDrawer(false)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      )}

      {/* Room & Romance Settings Modal */}
      {showSettingsModal && (
        <RoomSettingsModal
          settings={roomSettings}
          onSave={updateRoomSettings}
          onClose={() => setShowSettingsModal(false)}
          roomId={roomId}
        />
      )}
    </div>
  );
}
