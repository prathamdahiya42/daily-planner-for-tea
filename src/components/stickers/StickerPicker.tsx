"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Dices, Clock, Sparkles, MessageSquareHeart, Coffee } from "lucide-react";
import {
  STICKER_PACK,
  NOTO_STICKER_PACK,
  CAPTION_STICKER_PACK,
  getStickerById,
  getRandomCuteSticker,
  getRecentStickerIds,
  saveRecentStickerId,
  StickerDef,
} from "@/lib/stickers/stickers";

interface StickerPickerProps {
  onSelectSticker: (stickerId: string) => void;
  onClose: () => void;
}

type TabType = "recent" | "cute" | "captions" | "tea";

export function StickerPicker({ onSelectSticker, onClose }: StickerPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("cute");
  const [recentStickers, setRecentStickers] = useState<StickerDef[]>([]);
  const [isWobbling, setIsWobbling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const ids = getRecentStickerIds();
    const resolved = ids
      .map((id) => getStickerById(id))
      .filter((s): s is StickerDef => s !== undefined);
    setRecentStickers(resolved);
    // If no recents, default to cute tab
    if (resolved.length === 0 && activeTab === "recent") {
      setActiveTab("cute");
    }
  }, [activeTab]);

  const handleSelect = (sticker: StickerDef) => {
    saveRecentStickerId(sticker.id);
    onSelectSticker(sticker.id);
  };

  const handleDiceRoll = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 500);

    const random = getRandomCuteSticker();
    handleSelect(random);
  };

  const currentStickers = useMemo(() => {
    switch (activeTab) {
      case "recent":
        return recentStickers;
      case "cute":
        return NOTO_STICKER_PACK;
      case "captions":
        return CAPTION_STICKER_PACK;
      case "tea":
        return STICKER_PACK;
    }
  }, [activeTab, recentStickers]);

  return (
    <div
      className="fixed inset-0 z-40 bg-plum/40 backdrop-blur-xs flex flex-col justify-end select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[420px] mx-auto bg-surface rounded-t-[28px] shadow-2xl flex flex-col transition-all duration-300 ease-out border-t border-blush/60 ${
          isExpanded ? "h-[500px]" : "h-[360px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle with Snap Points (Phase 4.3) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-3 pb-1.5 flex items-center justify-center cursor-pointer group"
          title="Click to toggle expand/collapse"
          aria-label="Toggle picker height"
        >
          <div className="w-10 h-1.5 rounded-full bg-blush group-hover:bg-rose transition-colors" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-blush/40">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-display font-bold text-plum">Stickers</h2>
            <span className="text-[11px] font-hand text-rose">send some love 💕</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Random Cute Sticker Dice with Wobble (Phase 4.3) */}
            <button
              onClick={handleDiceRoll}
              className={`px-3 py-1.5 bg-cream-2 hover:bg-blush/60 active:scale-95 text-crimson rounded-2xl text-xs font-bold flex items-center gap-1.5 transition border border-blush/60 ${
                isWobbling ? "animate-wobble" : ""
              }`}
              title="Pick a random cute sticker!"
              aria-label="Random cute sticker"
            >
              <Dices className="w-4 h-4 text-crimson" />
              <span>Random</span>
            </button>

            {/* Close Button (>= 44px tap target) */}
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-plum-soft hover:text-plum rounded-2xl transition"
              aria-label="Close stickers"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Recent, Cute (Noto), Captions, Tea (Phase 4.3) */}
        <div className="px-3 pt-2 pb-1.5 flex items-center gap-1.5 border-b border-blush/30 overflow-x-auto no-scrollbar">
          {recentStickers.length > 0 && (
            <button
              onClick={() => setActiveTab("recent")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
                activeTab === "recent"
                  ? "bg-gradient-to-r from-crimson to-berry text-white shadow-xs"
                  : "bg-cream-2 text-plum-soft hover:bg-blush/50"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("cute")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "cute"
                ? "bg-gradient-to-r from-crimson to-berry text-white shadow-xs"
                : "bg-cream-2 text-plum-soft hover:bg-blush/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cute</span>
          </button>

          <button
            onClick={() => setActiveTab("captions")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "captions"
                ? "bg-gradient-to-r from-crimson to-berry text-white shadow-xs"
                : "bg-cream-2 text-plum-soft hover:bg-blush/50"
            }`}
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Captions</span>
          </button>

          <button
            onClick={() => setActiveTab("tea")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "tea"
                ? "bg-gradient-to-r from-crimson to-berry text-white shadow-xs"
                : "bg-cream-2 text-plum-soft hover:bg-blush/50"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Tea (Bears)</span>
          </button>
        </div>

        {/* Sticker Grid */}
        <div
          className={`flex-1 p-3 overflow-y-auto ${
            activeTab === "captions" ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-4 gap-2.5"
          }`}
        >
          {currentStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleSelect(sticker)}
              className={`group p-2 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 border ${
                activeTab === "captions"
                  ? "bg-cream-2/70 hover:bg-cream-2 border-blush/60 h-16"
                  : "bg-cream-2/50 hover:bg-cream-2 border-blush/40 aspect-square"
              }`}
              title={sticker.name}
              aria-label={sticker.name}
            >
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={sticker.file}
                  alt={sticker.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              {activeTab !== "captions" && (
                <span className="text-[9px] text-plum-soft font-body truncate w-full text-center mt-1">
                  {sticker.name}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
