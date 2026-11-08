"use client";

import React, { useState } from "react";
import { LogOut, Heart, Shield, Settings, Trash2 } from "lucide-react";
import { useRoom } from "@/context/RoomContext";
import { useChat } from "@/context/ChatContext";
import { calculateDaysTogether } from "@/lib/settings/room-settings";

interface ChatHeaderProps {
  onOpenSettings?: () => void;
}

export function ChatHeader({ onOpenSettings }: ChatHeaderProps) {
  const { exitRoomAndWipe, nickname } = useRoom();
  const { isPartnerOnline, roomSettings } = useChat();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const daysTogether = calculateDaysTogether(roomSettings.togetherSince);

  // Presence text
  const presenceText = isPartnerOnline
    ? roomSettings.partnerPronoun === "they"
      ? "they're here ✨"
      : `${roomSettings.partnerPronoun}'s here ✨`
    : "just us two";

  const handleExit = () => {
    exitRoomAndWipe();
  };

  return (
    <>
      <header className="px-4 pt-8 pb-3 bg-white/95 backdrop-blur-md border-b border-room-border flex items-center justify-between sticky top-0 z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-xl shadow-soft transition-all duration-700 ${
                isPartnerOnline
                  ? "ring-4 ring-rose-400/40 shadow-glow"
                  : "ring-0"
              }`}
            >
              🧸
            </div>

            {/* Presence glow */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full transition-all duration-500 ${
                isPartnerOnline
                  ? "bg-emerald-500 shadow-glow animate-pulse"
                  : "bg-slate-300"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                {roomSettings.partnerNickname || "Our Little Room"}
              </h1>
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span
                className={`font-semibold transition-colors duration-500 ${
                  isPartnerOnline ? "text-emerald-600 font-bold" : "text-rose-500"
                }`}
              >
                {presenceText}
              </span>

              {daysTogether !== null && (
                <>
                  <span>•</span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-100">
                    Day {daysTogether}
                  </span>
                </>
              )}

              <span>•</span>
              <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                <Shield className="w-3 h-3" />
                E2EE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Room Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-600 active:scale-95 rounded-xl transition"
              title="Room settings"
              aria-label="Room settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Exit Room & Wipe Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-0.5 border border-rose-100"
            title="Exit room and erase all local data"
            aria-label="Exit room"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Exit</span>
          </button>
        </div>
      </header>

      {/* Exit & Wipe Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-rose-100 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3 text-xl">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1.5">
              Exit Room?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              All messages and local keys will be <strong>erased from this device</strong> for your privacy. You can re-enter anytime with the room password.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="py-2.5 px-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
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
