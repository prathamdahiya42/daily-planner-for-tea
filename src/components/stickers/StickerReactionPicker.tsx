"use client";

import React from "react";
import { getStickerById } from "@/lib/stickers/stickers";

interface StickerReactionPickerProps {
  onSelectReaction: (stickerId: string) => void;
  onClose: () => void;
}

// 6 quick expressive bear stickers for message reactions
const QUICK_REACTION_STICKERS = [
  "sweet-01", // Hug
  "sweet-03", // Kiss
  "silly-01", // Tongue out
  "silly-04", // Cool
  "sorry-01", // Puppy eyes
  "missyou-01", // Photo
];

export function StickerReactionPicker({ onSelectReaction, onClose }: StickerReactionPickerProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-2xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 backdrop-blur-md border border-rose-100 rounded-3xl p-3 shadow-2xl flex items-center gap-2 animate-in zoom-in-95 duration-150"
      >
        {QUICK_REACTION_STICKERS.map((id) => {
          const sticker = getStickerById(id);
          if (!sticker) return null;
          return (
            <button
              key={id}
              onClick={() => {
                onSelectReaction(id);
                onClose();
              }}
              className="w-12 h-12 p-1.5 rounded-2xl hover:bg-rose-50 active:scale-110 transition flex items-center justify-center group"
              title={sticker.name}
            >
              <img
                src={sticker.file}
                alt={sticker.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
