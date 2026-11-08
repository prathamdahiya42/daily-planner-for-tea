"use client";

import React, { useState } from "react";
import { X, Send, Check, Shield, Bell } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";
import { RoomSettings } from "@/lib/settings/room-settings";

interface CodedSignalDrawerProps {
  roomSettings: RoomSettings;
  onSendSignal: (signalIndex: number) => Promise<{ success: boolean; suppressed?: boolean; error?: string }>;
  onClose: () => void;
  onOpenSettings?: () => void;
}

const SIGNAL_EMOJIS = ["💧", "📖", "🌙", "🧸", "☕", "🏃"];

export function CodedSignalDrawer({
  roomSettings,
  onSendSignal,
  onClose,
  onOpenSettings,
}: CodedSignalDrawerProps) {
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [sentIndex, setSentIndex] = useState<number | null>(null);
  const [quietWarning, setQuietWarning] = useState(false);

  const handleSelectSignal = async (index: number) => {
    if (sendingIndex !== null) return;
    setSendingIndex(index);
    setQuietWarning(false);

    const res = await onSendSignal(index);
    setSendingIndex(null);

    if (res.suppressed) {
      setQuietWarning(true);
      return;
    }

    if (res.success) {
      setSentIndex(index);
      setTimeout(() => {
        setSentIndex(null);
        onClose();
      }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm shadow-soft">
              🔔
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Coded Signals</h2>
              <p className="text-[11px] text-slate-400">Decoy notifications only you two understand</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            aria-label="Close signals"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiet Hours Alert if suppressed */}
        {quietWarning && (
          <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Signal suppressed: Quiet Hours are currently active.</span>
          </div>
        )}

        {/* Signals List */}
        <div className="p-4 space-y-2.5 overflow-y-auto">
          {APP_CONFIG.codedSignals.map((sig, idx) => {
            const secretLabel =
              roomSettings.customSignalLabels?.[idx] || sig.defaultSecretLabel;
            const isSending = sendingIndex === idx;
            const isSent = sentIndex === idx;

            return (
              <button
                key={sig.index}
                type="button"
                onClick={() => handleSelectSignal(sig.index)}
                disabled={sendingIndex !== null}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group active:scale-[0.98] ${
                  isSent
                    ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200"
                    : "bg-slate-50/70 hover:bg-slate-100/90 border-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/60 shadow-soft flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {SIGNAL_EMOJIS[idx]}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      {secretLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="font-medium text-slate-500">Decoy:</span>
                      <span className="italic truncate max-w-[180px]">"{sig.decoyBody}"</span>
                    </div>
                  </div>
                </div>

                <div className="pl-2">
                  {isSent ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-soft">
                      <Check className="w-4 h-4" />
                    </span>
                  ) : isSending ? (
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-soft animate-pulse">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-rose-500 group-hover:border-rose-300 flex items-center justify-center transition">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>Sends only index 0–5. No text exposed.</span>
          </div>

          {onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="font-bold text-rose-500 hover:text-rose-600 transition"
            >
              Edit Meanings ⚙️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
