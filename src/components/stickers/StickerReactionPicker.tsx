"use client";

import React from "react";
import { resolveSticker } from "@/lib/stickers/resolver";
import { Sticker } from "@/components/chat/Sticker";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum/30 backdrop-blur-xs select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface/95 backdrop-blur-md border border-blush rounded-3xl p-3 shadow-2xl flex items-center gap-2 animate-pop-in"
      >
        {QUICK_REACTION_STICKERS.map((id) => {
          const resolved = resolveSticker(id);
          return (
            <button
              key={id}
              onClick={() => {
                onSelectReaction(resolved.id);
                onClose();
              }}
              className="w-12 h-12 p-1 rounded-2xl hover:bg-cream-2 active:scale-110 transition flex items-center justify-center group overflow-hidden"
              title={resolved.name}
            >
              <Sticker
                payload={resolved}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
