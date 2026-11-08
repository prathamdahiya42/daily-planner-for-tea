"use client";

import React, { useState, useRef } from "react";
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
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startYRef.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length > 1) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      // Rubber-band resistance downward (Phase 5.4)
      setDragY(diff * 0.75);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 120) {
      // Swipe down to dismiss threshold exceeded (Phase 5.4)
      onClose();
    } else {
      setDragY(0);
    }
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      // Double tap detected!
      if (onToggleHeart) {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 650);
        onToggleHeart();
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
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

  const opacity = Math.max(0.4, 1 - dragY / 350);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 select-none animate-fade-in"
      style={{
        backgroundColor: `rgba(40, 19, 27, ${0.92 * opacity})`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      {/* Top Action Bar (>= 44px tap targets) */}
      <div
        className="w-full max-w-[420px] flex items-center justify-between pt-6 pb-2 text-white/90 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition"
          aria-label="Close photo"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-2">
          {onToggleHeart && (
            <button
              onClick={onToggleHeart}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition ${
                hasHeart ? "text-crimson" : "text-white"
              }`}
              aria-label="Heart photo"
            >
              <Heart
                className={`w-5 h-5 ${hasHeart ? "fill-crimson text-crimson" : ""}`}
              />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition"
            aria-label="Save photo"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Image Container with Swipe-Down Gesture & Native Pinch-Zoom (Phase 5.4) */}
      <div
        className="relative flex-1 flex items-center justify-center max-w-[420px] w-full"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 240ms cubic-bezier(0.2, 0, 0, 1)",
          touchAction: "pan-x pan-y pinch-zoom",
        }}
      >
        <img
          src={photoUrl}
          alt="Shared photo"
          className="max-h-[76vh] max-w-full object-contain rounded-3xl shadow-2xl select-none animate-entrance"
          onClick={handleImageTap}
        />

        {/* Double-tap Floating Heart Burst (Phase 5.4) */}
        {showBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <span className="absolute animate-heart-burst-1 text-crimson text-lg">❤️</span>
            <span className="absolute animate-heart-burst-2 text-rose text-2xl">💖</span>
            <span className="absolute animate-heart-burst-3 text-crimson text-xl">💕</span>
            <span className="absolute animate-heart-burst-4 text-berry text-base">💓</span>
            <span className="absolute animate-heart-burst-5 text-peach text-lg">💗</span>
            <span className="absolute animate-heart-burst-6 text-crimson text-2xl">❤️</span>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="text-[12px] font-hand text-white/70 pb-4 text-center select-none pointer-events-none">
        swipe down to close • double-tap to heart
      </div>
    </div>
  );
}
