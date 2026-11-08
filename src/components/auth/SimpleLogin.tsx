"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import { HeartSteamIcon } from "@/components/ui/BrandMotifs";

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cream font-body">
      <div className="w-full max-w-sm bg-cream-2/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-blush/60 flex flex-col items-center">
        {/* Logo with Soft Crimson Halo & Gentle Idle Float (Phase 1.3) */}
        <div className="relative mb-5 flex items-center justify-center">
          <div
            className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(209, 46, 83, 0.22) 0%, rgba(251, 200, 212, 0.12) 45%, transparent 70%)",
            }}
          />
          <div className="relative z-10 animate-logo-float">
            <Image
              src="/brand/logo-192.webp"
              alt="Our Little Room logo"
              width={112}
              height={112}
              priority
              decoding="async"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-contain ring-4 ring-crimson/80 shadow-soft"
            />
          </div>
        </div>

        {/* Title in Fraunces with Shimmer Effect */}
        <h1 className="text-2xl sm:text-3xl font-display font-bold shimmer-text tracking-tight mb-1 text-center">
          Our Little Room
        </h1>
        <p className="text-xs font-body text-plum-soft text-center mb-6 max-w-xs">
          A private, encrypted sanctuary for just us two 💕
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Identity Picker */}
          <div>
            <label className="block text-xs font-semibold text-plum-soft mb-1.5">
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
                    ? "bg-him/30 border-blue-300 text-plum shadow-sm ring-2 ring-him"
                    : "bg-surface/80 border-blush/40 text-plum-soft hover:bg-surface"
                }`}
              >
                <span>Him</span>
                <span className="text-sm">💙</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNickname("Her");
                  setUseCustomNick(false);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  !useCustomNick && nickname === "Her"
                    ? "bg-her/30 border-rose-300 text-plum shadow-sm ring-2 ring-her"
                    : "bg-surface/80 border-blush/40 text-plum-soft hover:bg-surface"
                }`}
              >
                <span>Her</span>
                <span className="text-sm">🌸</span>
              </button>
            </div>

            {/* Optional Custom Nickname Toggle */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setUseCustomNick(!useCustomNick)}
                className="text-[11px] text-crimson hover:text-berry font-medium underline"
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
                className="mt-1.5 w-full px-3.5 py-2 text-xs rounded-xl border border-blush focus:outline-none focus:ring-2 focus:ring-crimson/50 bg-surface/90 text-plum"
              />
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-plum-soft mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter room password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-3 text-base rounded-2xl border border-blush focus:outline-none focus:ring-2 focus:ring-crimson/50 bg-surface text-plum font-medium transition"
              />
              <Lock className="w-4 h-4 text-rose absolute left-3 top-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-plum-soft hover:text-plum focus:outline-none p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                className="w-4 h-4 rounded text-crimson focus:ring-crimson border-blush"
              />
              <span className="text-xs text-plum-soft">
                Keep me logged in on this device
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-berry/40 rounded-2xl text-xs text-berry font-medium animate-shake text-center">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-crimson to-berry hover:from-crimson/95 hover:to-berry/95 active:scale-[0.97] text-white font-bold rounded-2xl shadow-md transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2 font-body"
          >
            {isLoading ? (
              <>
                <HeartSteamIcon className="w-5 h-5 animate-pulse text-white" />
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
        <div className="mt-6 pt-4 border-t border-blush/30 w-full flex items-center justify-center gap-1.5 text-[11px] text-plum-soft">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero plaintext stored • AES-256 E2EE</span>
        </div>
      </div>
    </div>
  );
}
