"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { HeartSteamIcon, SpeechBubbleHeartIcon } from "@/components/ui/BrandMotifs";
import { applyTheme, getStoredTheme } from "@/lib/theme/theme";

function formatDateChip(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

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
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  // Apply dark/light theme on mount (Phase 3.4)
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  // Track scroll state for hairline header border (Phase 3.1)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrolled = scrollContainerRef.current.scrollTop > 8;
    setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
  };

  // Track initial history vs new messages so history never animates (Phase 3.2)
  const newMessagesSet = useMemo(() => {
    const newSet = new Set<string>();
    if (messages.length === 0) return newSet;

    if (isInitialLoadRef.current) {
      // First batch: all are historical, do not animate
      messages.forEach((m) => seenMessageIdsRef.current.add(m.id));
      isInitialLoadRef.current = false;
    } else {
      messages.forEach((m) => {
        if (!seenMessageIdsRef.current.has(m.id)) {
          newSet.add(m.id);
          seenMessageIdsRef.current.add(m.id);
        }
      });
    }
    return newSet;
  }, [messages]);

  // Auto-scroll to bottom on messages update or partner typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isPartnerTyping]);

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

  const currentTheme =
    BACKGROUND_THEMES[roomSettings.backgroundTheme] || BACKGROUND_THEMES["warm-rose"];

  return (
    <div
      onClick={handleBackgroundClick}
      className={`w-full max-w-[420px] mx-auto h-[100dvh] max-h-[100dvh] overflow-hidden ${currentTheme.bgClass} room-chat-pattern flex flex-col font-body select-none transition-colors duration-500 relative`}
    >
      {/* Top Header with Glass Effect and Hairline Border (Phase 3.1) */}
      <ChatHeader onOpenSettings={() => setShowSettingsModal(true)} isScrolled={isScrolled} />

      {/* Message Stream (strict internal scroll, never body - Phase 3.1) */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 px-3 py-2 overflow-y-auto flex flex-col justify-end"
        aria-live="polite"
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-plum-soft gap-2 py-20 font-body">
            <HeartSteamIcon className="w-5 h-5 animate-pulse text-crimson" />
            <span>Decrypting messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-cream-2 border border-blush/60 flex items-center justify-center mb-4 shadow-soft">
              <SpeechBubbleHeartIcon className="w-12 h-12" />
            </div>
            <h3 className="text-base font-display font-bold text-plum">
              Say hi to your favourite person
            </h3>
            <p className="text-sm font-hand text-rose mt-1 max-w-[220px] leading-relaxed">
              our little encrypted corner of the world...
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const nextMsg = messages[idx + 1];

              // Date chip: check if first message or date changed
              const msgDate = new Date(msg.created_at).toDateString();
              const prevDate = prevMsg ? new Date(prevMsg.created_at).toDateString() : null;
              const showDateChip = msgDate !== prevDate;

              // Grouping: is this the last message in a consecutive run from the same sender?
              const isLastInGroup =
                !nextMsg ||
                nextMsg.sender_device_id !== msg.sender_device_id ||
                new Date(nextMsg.created_at).getTime() - new Date(msg.created_at).getTime() > 120000;

              return (
                <React.Fragment key={msg.id}>
                  {/* Sticky Date Chip (Phase 3.3) */}
                  {showDateChip && (
                    <div className="sticky top-2 z-10 mx-auto my-2.5">
                      <span className="px-3 py-0.5 rounded-full font-display italic text-[11px] bg-surface/90 border border-blush/70 text-plum-soft shadow-xs backdrop-blur-xs">
                        {formatDateChip(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <MessageBubble
                    message={msg}
                    isMe={msg.sender_device_id === deviceId}
                    isNew={newMessagesSet.has(msg.id)}
                    isLastInGroup={isLastInGroup}
                    onReply={(m) => setReplyingTo(m)}
                    onEdit={(m) => setEditingMessage(m)}
                    onUnsend={(m) => unsendMessage(m.id)}
                    onToggleHeart={(id) => toggleHeartReaction(id)}
                    onToggleStickerReaction={(msgId, stId) => toggleStickerReaction(msgId, stId)}
                    onVisible={(id) => markMessageSeen(id)}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Partner Typing Indicator: 3 bouncing hearts + HeartSteamIcon + Caveat (Phase 3.3) */}
        {isPartnerTyping && (
          <div className="h-7 flex items-center gap-1.5 px-3 py-1 my-1 self-start rounded-full bg-surface/80 border border-blush/60 shadow-xs animate-fade-in">
            <HeartSteamIcon className="w-3.5 h-3.5 text-crimson animate-pulse" />
            <div className="flex items-center gap-0.5 text-rose text-xs">
              <span className="animate-bounce text-[10px]">❤️</span>
              <span className="animate-bounce [animation-delay:0.18s] text-[10px]">❤️</span>
              <span className="animate-bounce [animation-delay:0.36s] text-[10px]">❤️</span>
            </div>
            <span className="font-hand text-[13px] font-semibold text-rose ml-1">
              typing a little note…
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input Bar with Glass Styling & dvh support (Phase 3.1) */}
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
