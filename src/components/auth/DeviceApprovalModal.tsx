"use client";

import React, { useState } from "react";
import { ShieldCheck, X, Check, KeyRound } from "lucide-react";
import { PendingDevice } from "@/context/RoomContext";
import { APP_CONFIG } from "@/config/app.config";

interface DeviceApprovalModalProps {
  device: PendingDevice;
  onApprove: (deviceId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  onDismiss: () => void;
}

export function DeviceApprovalModal({ device, onApprove, onDismiss }: DeviceApprovalModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== APP_CONFIG.security.pinLength) {
      setError(`Enter your ${APP_CONFIG.security.pinLength}-digit PIN to authorize approval`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const res = await onApprove(device.id, pin);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Approval failed");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-2">
          <div className="w-8" />
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-base font-bold text-slate-800 text-center">New Partner Device Request</h2>
        <p className="text-xs text-slate-500 mt-1 text-center leading-relaxed">
          A second device has entered the shared passphrase and is requesting to pair with your room.
        </p>

        <div className="my-3 w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
            Pending Device ID
          </span>
          <span className="font-mono text-xs text-slate-700">{device.id.slice(0, 18)}...</span>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
              Enter your PIN to authorize
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full px-3 py-2 text-center tracking-[0.4em] font-mono text-lg bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 text-slate-800"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-600 font-medium text-center p-2 bg-rose-50 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Deny
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pin.length !== APP_CONFIG.security.pinLength}
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
