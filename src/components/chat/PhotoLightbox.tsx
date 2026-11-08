"use client";

import React, { useState } from "react";
import { X, Download, Heart } from "lucide-react";

interface PhotoLightboxProps {
  photoUrl: string;
  onClose: () => void;
  onToggleHeart?: () => void;
  hasHeart?: boolean;
}

export function PhotoLightbox({
  photoUrl,
  onClose,
  onToggleHeart,
  hasHeart = false,
}: PhotoLightboxProps) {
  const [showBurst, setShowBurst] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTap < 320) {
      // Double tap!
      if (onToggleHeart) {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 900);
        onToggleHeart();
      }
      setLastTap(0);
    } else {
      setLastTap(now);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div
        className="w-full max-w-[420px] flex items-center justify-between pt-6 pb-2 text-white/80 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-3">
          {onToggleHeart && (
            <button
              onClick={onToggleHeart}
              className={`p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition ${
                hasHeart ? "text-rose-500" : "text-white"
              }`}
              aria-label="Heart photo"
            >
              <Heart
                className={`w-5 h-5 ${hasHeart ? "fill-rose-500 text-rose-500" : ""}`}
              />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
            aria-label="Save photo"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        className="relative flex-1 flex items-center justify-center max-w-[420px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photoUrl}
          alt="Shared memory"
          className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl select-none"
          onClick={handleImageTap}
        />

        {showBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-bounce z-20">
            <Heart className="w-20 h-20 fill-rose-500 text-rose-500 drop-shadow-2xl scale-125 transition-transform" />
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="text-[11px] text-white/50 pb-4 text-center select-none pointer-events-none">
        Double-tap anywhere to send a heart • Tap outside to close
      </div>
    </div>
  );
}
