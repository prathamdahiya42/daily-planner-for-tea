"use client";

import React, { useState } from "react";
import { Lock, Delete, ArrowLeft } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";

interface PinModalProps {
  onUnlock: (pin: string) => Promise<{ success: boolean; error?: string; wiped?: boolean }>;
  onCancel: () => void;
  remainingAttempts: number;
}

export function PinModal({ onUnlock, onCancel, remainingAttempts }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleDigit = async (digit: string) => {
    if (isLoading || pin.length >= APP_CONFIG.security.pinLength) return;

    const nextPin = pin + digit;
    setPin(nextPin);
    setError(null);

    if (nextPin.length === APP_CONFIG.security.pinLength) {
      setIsLoading(true);
      const res = await onUnlock(nextPin);
      setIsLoading(false);

      if (!res.success) {
        setIsShaking(true);
        setError(res.error || "Incorrect PIN");
        setPin("");
        setTimeout(() => setIsShaking(false), 500);

        if (res.wiped) {
          // If wiped, close modal back to decoy after 1.5s
          setTimeout(() => {
            onCancel();
          }, 1500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (isLoading || pin.length === 0) return;
    setPin(pin.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Top bar with back button */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition"
            aria-label="Back to planner"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div className="w-9" />
        </div>

        <h2 className="text-lg font-bold text-slate-800">Enter Security PIN</h2>
        <p className="text-xs text-slate-400 mt-1 text-center">
          Enter your 6-digit device PIN to open
        </p>

        {/* PIN Dots */}
        <div
          className={`flex items-center gap-3 my-6 ${
            isShaking ? "animate-bounce text-red-500" : ""
          }`}
        >
          {Array.from({ length: APP_CONFIG.security.pinLength }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? "bg-rose-500 scale-110 shadow-sm"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Status / Error Message */}
        {error ? (
          <div className="text-xs text-rose-600 font-medium text-center mb-4 px-2 py-1 bg-rose-50 rounded-lg">
            {error}
          </div>
        ) : remainingAttempts < APP_CONFIG.security.maxPinAttempts ? (
          <div className="text-xs text-amber-600 font-medium text-center mb-4">
            Warning: {remainingAttempts} attempts remaining before device wipe
          </div>
        ) : (
          <div className="h-6 mb-2" />
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              disabled={isLoading}
              className="h-14 rounded-2xl bg-slate-50 text-slate-800 text-xl font-semibold active:bg-rose-100 active:scale-95 transition flex items-center justify-center hover:bg-slate-100"
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPin("")}
            disabled={isLoading || pin.length === 0}
            className="h-14 rounded-2xl text-xs font-medium text-slate-400 active:bg-slate-100 transition flex items-center justify-center"
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit("0")}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-slate-50 text-slate-800 text-xl font-semibold active:bg-rose-100 active:scale-95 transition flex items-center justify-center hover:bg-slate-100"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading || pin.length === 0}
            className="h-14 rounded-2xl text-slate-500 active:bg-slate-100 active:scale-95 transition flex items-center justify-center hover:bg-slate-50"
            aria-label="Delete last digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
