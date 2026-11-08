"use client";

import React, { useState, useMemo } from "react";
import { resolveSticker, ResolvedSticker } from "@/lib/stickers/resolver";

interface StickerProps {
  payload: unknown;
  className?: string;
  size?: number | "default" | "small" | "large";
  priority?: boolean;
}

export function Sticker({ payload, className = "", size = "default", priority = false }: StickerProps) {
  // 0 = primary file, 1 = fallback file, 2 = inline svg capsule, 3 = emoji glyph
  const [errorStep, setErrorStep] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const sticker: ResolvedSticker = useMemo(() => {
    return resolveSticker(payload);
  }, [payload]);

  const isCaption = sticker.category === "captions" || Boolean(sticker.caption);

  // Dimension classes
  let sizeClass = "w-32 h-32";
  if (size === "small") sizeClass = "w-8 h-8";
  else if (size === "large") sizeClass = "w-40 h-40";
  if (isCaption) {
    sizeClass = size === "small" ? "w-20 h-7" : "w-44 h-16";
  }

  const handleImageError = () => {
    setErrorStep((prev) => prev + 1);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden ${sizeClass} ${className}`}
      style={{ contain: "paint" }}
    >
      {/* Skeleton placeholder while loading image */}
      {!isLoaded && errorStep < 2 && (
        <div className="absolute inset-0 rounded-2xl bg-cream-2/60 animate-pulse flex items-center justify-center">
          <span className="text-xl opacity-40">{sticker.emoji}</span>
        </div>
      )}

      {/* Step 0: Primary SVG */}
      {errorStep === 0 && (
        <img
          src={sticker.file}
          alt={sticker.name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-contain drop-shadow-sm transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Step 1: Fallback SVG */}
      {errorStep === 1 && (
        <img
          src={sticker.fallbackFile}
          alt={sticker.name}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      )}

      {/* Step 2: Inline SVG Capsule Fallback */}
      {errorStep === 2 && (
        <div className="w-full h-full flex items-center justify-center p-1">
          {isCaption ? (
            <div className="w-full h-full rounded-2xl bg-gradient-to-r from-cream-2 to-surface border-2 border-blush/80 px-3 py-1.5 flex items-center justify-center shadow-xs">
              <span className="font-hand text-[15px] font-bold text-crimson text-center tracking-tight leading-tight">
                {sticker.caption || sticker.name}
              </span>
            </div>
          ) : (
            <div className="w-full h-full rounded-3xl bg-cream-2/70 border border-blush flex flex-col items-center justify-center gap-1 shadow-soft p-2">
              <span className="text-4xl">{sticker.emoji}</span>
              <span className="font-hand text-xs font-semibold text-crimson text-center truncate max-w-full">
                {sticker.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Pure Emoji Glyph Fallback (Guaranteed never to fail) */}
      {errorStep >= 3 && (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 rounded-2xl bg-cream-2/40 border border-blush/40">
          <span className="text-4xl filter drop-shadow-sm">{sticker.emoji}</span>
          <span className="font-hand text-[11px] text-rose mt-0.5">{sticker.name}</span>
        </div>
      )}
    </div>
  );
}
