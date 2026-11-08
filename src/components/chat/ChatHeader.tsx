"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LogOut, Heart, Shield, Settings, Palette, Image as ImageIcon, Trash2 } from "lucide-react";
import { useRoom } from "@/context/RoomContext";
import { useChat } from "@/context/ChatContext";
import { calculateDaysTogether } from "@/lib/settings/room-settings";
import { HerAvatar } from "@/components/ui/BrandMotifs";

interface ChatHeaderProps {
  onOpenSettings?: () => void;
  onOpenAppearance?: () => void;
  onOpenWallpaper?: () => void;
  isScrolled?: boolean;
}

export function ChatHeader({
  onOpenSettings,
  onOpenAppearance,
  onOpenWallpaper,
  isScrolled = false,
}: ChatHeaderProps) {
  const { exitRoomAndWipe, nickname } = useRoom();
  const { isPartnerOnline, isPartnerTyping, roomSettings } = useChat();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const daysTogether = calculateDaysTogether(roomSettings.togetherSince);

  // Presence text in Caveat 14px in --rose with soft pulse dot (Phase 3.1)
  let presenceText = "just us two";
  if (isPartnerTyping) {
    presenceText = "typing a little note…";
  } else if (isPartnerOnline) {
    presenceText = roomSettings.partnerPronoun === "they"
      ? "they're here ✨"
      : `${roomSettings.partnerPronoun}'s here ✨`;
  }

  const handleExit = () => {
    exitRoomAndWipe();
  };

  // Determine avatar: if current user is "Him", partner is "Her" (and vice versa)
  const isPartnerHer = nickname === "Him";

  return (
    <>
      <header
        className={`px-4 pt-6 pb-2.5 glass-chrome flex items-center justify-between sticky top-0 z-20 transition-all duration-200 ${
          isScrolled ? "border-b border-blush/80 shadow-xs" : "border-b border-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Partner Avatar (36px circular badge matching logo styling - Phase 3.1) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="relative p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-crimson/40 active:scale-95 transition-transform"
            aria-label="Open partner settings"
            title="Open partner profile & settings"
          >
            {isPartnerHer ? (
              <HerAvatar size={36} className="shadow-soft" />
            ) : (
              <div className="relative w-9 h-9 rounded-full ring-2 ring-crimson shadow-soft overflow-hidden bg-cream-2 shrink-0">
                <Image
                  src="/brand/logo-96.webp"
                  alt="Partner avatar"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Subtle presence pulse dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-surface rounded-full transition-all duration-300 ${
                isPartnerTyping
                  ? "bg-crimson animate-ping"
                  : isPartnerOnline
                  ? "bg-emerald-500 shadow-glow"
                  : "bg-blush"
              }`}
            />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-display font-bold text-plum leading-tight">
                {roomSettings.partnerNickname || "Our Little Room"}
              </h1>
              <Heart className="w-3 h-3 fill-crimson text-crimson animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-plum-soft">
              {/* Presence text in Caveat 14px in --rose (Phase 3.1) */}
              <span
                className={`font-hand text-[14px] leading-tight font-semibold transition-colors duration-300 ${
                  isPartnerTyping
                    ? "text-crimson font-bold animate-pulse"
                    : isPartnerOnline
                    ? "font-bold"
                    : "text-rose"
                }`}
                style={
                  isPartnerOnline
                    ? { color: "var(--status-online, #34D399)" }
                    : undefined
                }
              >
                {presenceText}
              </span>

              {daysTogether !== null && (
                <>
                  <span className="text-blush">•</span>
                  <span className="font-display italic text-crimson font-medium bg-cream-2 px-1.5 py-0.2 rounded-md border border-blush/50">
                    Day {daysTogether}
                  </span>
                </>
              )}

              <span className="text-blush">•</span>
              <span
                className="flex items-center gap-0.5 font-medium"
                style={{ color: "var(--status-e2ee, #34D399)" }}
              >
                <Shield className="w-3 h-3" />
                E2EE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Appearance Style & Color Button */}
          {onOpenAppearance && (
            <button
              onClick={onOpenAppearance}
              className="w-10 h-10 flex items-center justify-center text-plum-soft hover:text-crimson active:scale-95 rounded-2xl transition"
              title="Theme & Appearance"
              aria-label="Theme & Appearance"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Chat Wallpaper Button */}
          {onOpenWallpaper && (
            <button
              onClick={onOpenWallpaper}
              className="w-10 h-10 flex items-center justify-center text-plum-soft hover:text-crimson active:scale-95 rounded-2xl transition"
              title="Chat Wallpaper"
              aria-label="Chat Wallpaper"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}

          {/* Room Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-10 h-10 flex items-center justify-center text-plum-soft hover:text-plum active:scale-95 rounded-2xl transition"
              title="Room settings"
              aria-label="Room settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Exit Room & Wipe Button (Sleek 40px icon button) */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="w-10 h-10 flex items-center justify-center text-rose hover:text-crimson hover:bg-cream-2/60 active:scale-95 rounded-2xl transition border border-blush/40 ml-0.5"
            title="Exit room and erase all local data"
            aria-label="Exit room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Exit & Wipe Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-plum/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-blush text-center">
            <div className="w-12 h-12 rounded-2xl bg-cream-2 text-crimson flex items-center justify-center mx-auto mb-3 text-xl">
              <Trash2 className="w-6 h-6 text-crimson" />
            </div>
            <h3 className="text-base font-display font-bold text-plum mb-1.5">
              Exit Room?
            </h3>
            <p className="text-xs font-body text-plum-soft mb-5 leading-relaxed">
              All messages and local keys will be <strong>erased from this device</strong> for your privacy. You can re-enter anytime with the room password.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-3 bg-cream-2 hover:bg-blush/60 text-plum text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="py-2.5 px-3 bg-crimson hover:bg-berry text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Exit & Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
