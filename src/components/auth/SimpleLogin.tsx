"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { HeartSteamIcon } from "@/components/ui/BrandMotifs";
import { FloatingPetals } from "./FloatingPetals";

interface SimpleLoginProps {
  onEnter: (password: string, nickname: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
}

export function SimpleLogin({ onEnter, onCancel }: SimpleLoginProps) {
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState<"Him" | "Her">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("olr_identity");
        if (saved === "Her" || saved === "Him") return saved;
      } catch {}
    }
    return "Him";
  });
  const [customNickname, setCustomNickname] = useState("");
  const [useCustomNick, setUseCustomNick] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [pillSpring, setPillSpring] = useState<"Him" | "Her" | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus cleanly on mount without causing page scroll jump (Phase 2.3)
  useEffect(() => {
    passwordInputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleIdentitySelect = (chosen: "Him" | "Her") => {
    // Ultra-short haptic feedback (Phase 2.2)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("olr_identity", chosen);
        if ("vibrate" in navigator) {
          navigator.vibrate(8);
        }
      } catch {}
    }
    setNickname(chosen);
    setUseCustomNick(false);
    // Tap scales slightly 0.96 -> 1.0 (Phase 2.2)
    setPillSpring(chosen);
    setTimeout(() => setPillSpring(null), 180);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    const effectiveNickname = useCustomNick && customNickname.trim()
      ? customNickname.trim()
      : nickname;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);

    try {
      const res = await onEnter(password.trim(), effectiveNickname, remember);
      if (res.success) {
        // Exit animation: card fades and scales up to 1.05 in 180ms (Phase 2.4)
        setIsExiting(true);
      } else {
        triggerErrorState("Unable to unlock room. Please check your password.");
      }
    } catch {
      triggerErrorState("Unable to unlock room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerErrorState = (msg: string) => {
    setHasError(true);
    setErrorMessage(msg);
    // Haptic on error: [15, 60, 15] (Phase 2.4)
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 60, 15]);
      } catch {}
    }
    // Clear password and keep focus (Phase 2.4)
    setPassword("");
    setTimeout(() => {
      passwordInputRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-cream font-body relative overflow-hidden select-none">
      {/* Ambient floating petals/hearts effect (Phase 2.1) */}
      <FloatingPetals />

      {/* Main Login Card with smooth entrance/exit transitions */}
      <div
        className={`w-full max-w-[390px] bg-cream-2/90 backdrop-blur-md rounded-[28px] p-6 sm:p-7 shadow-xl border border-blush/60 flex flex-col items-center relative z-10 transition-all duration-180 ease-out ${
          isExiting
            ? "opacity-0 scale-105 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        {/* Back to Decoy Planner button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-5 left-5 p-2 rounded-xl text-plum-soft hover:text-plum hover:bg-cream-2 active:scale-95 transition"
            title="Return to Planner"
            aria-label="Return to daily planner"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Logo: centered, 96px, with soft pulsating crimson ring (Phase 2.1) */}
        <div className="relative mb-3 flex items-center justify-center mt-1">
          <div className="relative z-10">
            <Image
              src="/brand/logo-192.webp"
              alt="Our Little Room logo"
              width={96}
              height={96}
              priority
              decoding="async"
              className="w-24 h-24 rounded-full object-contain ring-2 ring-crimson animate-pulse-ring shadow-soft"
            />
          </div>
        </div>

        {/* Title: "Our Little Room" in Fraunces 26px / 600, warm plum (Phase 2.1) */}
        <h1 className="font-display text-[26px] font-semibold text-plum tracking-tight text-center leading-tight">
          Our Little Room
        </h1>
        {/* Subtitle: "just for the two of us" in Caveat 18px / 600 in --plum-soft (Phase 2.1) */}
        <p className="font-hand text-[18px] font-semibold text-plum-soft text-center mt-0.5 mb-5">
          just for the two of us
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Who are you? selector: Two toggle pills (Him / Her) (Phase 2.2) */}
          <div>
            <label className="block text-xs font-semibold text-plum-soft mb-1.5 text-center">
              Who are you?
            </label>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* Him Pill Button */}
              <button
                type="button"
                onClick={() => handleIdentitySelect("Him")}
                className={`py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  !useCustomNick && nickname === "Him"
                    ? "bg-him/40 border-him text-plum shadow-sm ring-2 ring-crimson"
                    : "bg-surface/90 border-blush/40 text-plum-soft hover:bg-surface"
                } ${pillSpring === "Him" ? "scale-[0.96]" : "scale-100"} active:scale-[0.96]`}
              >
                {/* Him Icon */}
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
                  <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 17C4 13.6863 6.68629 11 10 11C13.3137 11 16 13.6863 16 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span>Him</span>
              </button>

              {/* Her Pill Button */}
              <button
                type="button"
                onClick={() => handleIdentitySelect("Her")}
                className={`py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  !useCustomNick && nickname === "Her"
                    ? "bg-her/40 border-her text-plum shadow-sm ring-2 ring-crimson"
                    : "bg-surface/90 border-blush/40 text-plum-soft hover:bg-surface"
                } ${pillSpring === "Her" ? "scale-[0.96]" : "scale-100"} active:scale-[0.96]`}
              >
                {/* Her Flower Icon */}
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" aria-hidden="true">
                  <circle cx="10" cy="10" r="3" fill="var(--crimson)" />
                  <circle cx="10" cy="5" r="2" fill="var(--rose)" />
                  <circle cx="10" cy="15" r="2" fill="var(--rose)" />
                  <circle cx="5" cy="10" r="2" fill="var(--rose)" />
                  <circle cx="15" cy="10" r="2" fill="var(--rose)" />
                </svg>
                <span>Her</span>
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
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Enter your nickname..."
                  value={customNickname}
                  onChange={(e) => setCustomNickname(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2.5 text-[16px] rounded-full border border-blush focus:outline-none focus:ring-2 focus:ring-crimson/50 bg-cream-2 text-plum font-medium"
                />
              </div>
            )}
          </div>

          {/* Password field: pill-shaped, min 16px font, floating/smooth placeholder (Phase 2.3) */}
          <div>
            <div
              className={`relative ${
                hasError ? "animate-shake-horizontal" : ""
              }`}
            >
              <input
                ref={passwordInputRef}
                id="room-password-input"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (hasError) setHasError(false);
                }}
                autoComplete="current-password"
                className={`peer w-full pl-11 pr-12 pt-5 pb-2 text-[16px] rounded-full border bg-surface/90 text-plum font-medium transition focus:outline-none focus:ring-2 ${
                  hasError
                    ? "border-berry ring-2 ring-berry/40"
                    : "border-blush focus:border-crimson focus:ring-crimson/40"
                }`}
              />
              <Lock
                className={`w-4 h-4 absolute left-4 top-4.5 transition-colors pointer-events-none ${
                  hasError ? "text-berry" : "text-rose"
                }`}
              />

              {/* Floating smooth placeholder: "the secret phrase…" (Phase 2.3) */}
              <label
                htmlFor="room-password-input"
                className="absolute left-11 top-2 text-[11px] font-semibold text-plum-soft transition-all pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-plum-soft/80 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-crimson"
              >
                the secret phrase…
              </label>

              {/* Eye icon: stroke width 1.75, 44px tap target (Phase 2.3) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-11 h-11 flex items-center justify-center absolute right-1 top-1.5 text-plum-soft hover:text-plum focus:outline-none rounded-full"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[1.75]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[1.75]" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center justify-between px-1 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-crimson focus:ring-crimson border-blush"
              />
              <span className="text-xs text-plum-soft">
                Remember me on this device
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-berry/40 rounded-xl text-xs text-berry font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Enter button: "Open our room" in Fraunces 16px, gradient crimson -> berry, rounded-full, 6s idle shimmer (Phase 2.4) */}
          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full relative overflow-hidden py-3.5 bg-gradient-to-r from-crimson to-berry hover:from-crimson/95 hover:to-berry/95 active:scale-[0.97] text-white font-display text-[16px] font-semibold rounded-full shadow-md transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {/* Subtle single-pass light-sweep shimmer every 6s when idle (Phase 2.4) */}
            <span
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-button-shine"
              aria-hidden="true"
            />

            {isLoading ? (
              <>
                <HeartSteamIcon className="w-5 h-5 animate-pulse text-white" />
                <span>Opening our room...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Open our room</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-5 pt-3.5 border-t border-blush/30 w-full flex items-center justify-center gap-1.5 text-[11px] text-plum-soft">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero plaintext stored • AES-256 E2EE</span>
        </div>
      </div>
    </div>
  );
}
