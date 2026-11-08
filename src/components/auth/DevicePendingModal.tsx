"use client";

import React from "react";
import { ArrowLeft, ShieldAlert, Heart, Loader2 } from "lucide-react";

interface DevicePendingModalProps {
  deviceId: string | null;
  onCancel: () => void;
}

export function DevicePendingModal({ deviceId, onCancel }: DevicePendingModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Back button */}
        <div className="w-full flex justify-start mb-2">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition"
            aria-label="Back to planner"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Heart Pulsing */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-soft">
            <Heart className="w-8 h-8 fill-rose-500 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800">Waiting for Approval</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed px-2">
          Your passphrase proof was accepted. For security, your partner must approve this phone
          from their unlocked app using their PIN.
        </p>

        {deviceId && (
          <div className="my-5 w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
              Device Request ID
            </span>
            <span className="font-mono text-xs text-slate-600">{deviceId.slice(0, 16)}...</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50/80 px-3.5 py-2 rounded-xl mb-4">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>This screen will automatically unlock as soon as your partner approves.</span>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          Return to Daily Planner
        </button>
      </div>
    </div>
  );
}
