"use client";

import React, { useState } from "react";
import { KeyRound, Sparkles, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { generateSuggestedPassphrase, validatePassphrase } from "@/lib/crypto/wordlist";
import { APP_CONFIG } from "@/config/app.config";

interface PassphraseModalProps {
  onSetup: (passphrase: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function PassphraseModal({ onSetup, onCancel }: PassphraseModalProps) {
  const [passphrase, setPassphrase] = useState(() => generateSuggestedPassphrase());
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeriving, setIsDeriving] = useState(false);

  const handleRegenerate = () => {
    setPassphrase(generateSuggestedPassphrase());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validatePassphrase(passphrase);
    if (!validation.valid) {
      setError(validation.error || "Invalid passphrase");
      return;
    }

    if (pin.length !== APP_CONFIG.security.pinLength || !/^\d+$/.test(pin)) {
      setError(`Personal PIN must be exactly ${APP_CONFIG.security.pinLength} digits`);
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setIsDeriving(true);
    const res = await onSetup(passphrase, pin);
    setIsDeriving(false);

    if (!res.success) {
      setError(res.error || "Failed to set up room");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition"
            aria-label="Back to planner"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="w-9" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 text-center">Room Pairing & Setup</h2>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Both partners share this 4-word passphrase. Your PIN protects this phone.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Shared Passphrase */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Shared Passphrase</label>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition"
              >
                <RefreshCw className="w-3 h-3" />
                Randomize
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="word1-word2-word3-word4"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 4 words (at least 16 characters).
            </p>
          </div>

          {/* Personal PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Personal 6-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full px-3.5 py-2.5 text-center tracking-[0.5em] text-lg font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 text-slate-800"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm 6-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full px-3.5 py-2.5 text-center tracking-[0.5em] text-lg font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 text-slate-800"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="text-xs text-rose-600 font-medium px-3 py-2 bg-rose-50 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDeriving}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white rounded-2xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isDeriving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Deriving Argon2id Keys...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Derive Keys & Unlock Room
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Keys are derived locally in browser and never sent to any server</span>
        </div>
      </div>
    </div>
  );
}
