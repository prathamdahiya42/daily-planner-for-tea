"use client";

import React, { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number; // percentage
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  opacity: number;
  isHeart: boolean;
}

export function FloatingPetals() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Rule 7: Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Check low-spec devices (Rule 7: <= 4 logical cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      return;
    }

    // Generate max 8-10 petals
    const generated: Petal[] = Array.from({ length: 9 }).map((_, i) => ({
      id: i,
      left: Math.round(5 + (i * 10) + Math.random() * 5),
      size: Math.round(12 + Math.random() * 10),
      duration: Math.round(15 + Math.random() * 7), // 15-22s
      delay: Math.round(i * 1.8), // staggered
      opacity: Number((0.35 + Math.random() * 0.25).toFixed(2)), // 0.35 - 0.6
      isHeart: i % 2 === 0,
    }));

    setPetals(generated);
    setShouldRender(true);

    // Pause when document hidden to save CPU/battery
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!shouldRender || isPaused) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
          className="absolute bottom-[-20px] animate-petal-drift will-change-transform text-rose"
        >
          {p.isHeart ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              {/* Soft romantic flower petal */}
              <path d="M12 2C8 6 6 10 7 14C8 18 12 22 12 22C12 22 16 18 17 14C18 10 16 6 12 2Z" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
