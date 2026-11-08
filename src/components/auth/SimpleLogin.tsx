"use client";

import React, { useState } from "react";
import { Heart, Lock, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";

interface SimpleLoginProps {
  onEnter: (password: string, nickname: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
}

export function SimpleLogin({ onEnter }: SimpleLoginProps) {
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("Him");
  const [customNickname, setCustomNickname] = useState("");
  const [useCustomNick, setUseCustomNick] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage("Please enter our secret password.");
      return;
    }

    const effectiveNickname = useCustomNick && customNickname.trim()
      ? customNickname.trim()
      : nickname;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await onEnter(password.trim(), effectiveNickname, remember);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to enter room. Check the password.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-amber-50 to-pink-100 font-sans">
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100/80 flex flex-col items-center">
        {/* Cute Couple Avatar */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center text-4xl shadow-md border-2 border-white">
            🧸
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm border border-rose-100">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5 mb-1">
          Our Little Room
        </h1>
        <p className="text-xs text-slate-500 text-center mb-6 max-w-xs">
          A private, encrypted sanctuary for just us two 💕
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Identity Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Who is entering?
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setNickname("Him");
                  setUseCustomNick(false);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  !useCustomNick && nickname === "Him"
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span>Him</span>
                <span>💙</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNickname("Her");
                  setUseCustomNick(false);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  !useCustomNick && nickname === "Her"
                    ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span>Her</span>
                <span>🌸</span>
              </button>
            </div>

            {/* Optional Custom Nickname Toggle */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setUseCustomNick(!useCustomNick)}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-medium underline"
              >
                {useCustomNick ? "Use preset (Him/Her)" : "Custom nickname?"}
              </button>
            </div>

            {useCustomNick && (
              <input
                type="text"
                placeholder="Enter your nickname..."
                value={customNickname}
                onChange={(e) => setCustomNickname(e.target.value)}
                maxLength={20}
                className="mt-1.5 w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400/50 bg-rose-50/30"
              />
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter room password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/50 bg-slate-50/50 font-medium text-slate-800 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 border-slate-300"
              />
              <span className="text-xs text-slate-500">
                Keep me logged in on this device
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-medium animate-shake text-center">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Unlocking Our Room...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enter Our Room</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero plaintext stored • AES-256 E2EE</span>
        </div>
      </div>
    </div>
  );
}
