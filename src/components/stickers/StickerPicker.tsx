"use client";

import React, { useState } from "react";
import { X, Sparkles, Dices, Star } from "lucide-react";
import {
  STICKER_PACK,
  MOOD_TABS,
  StickerMood,
  getStickerOfTheDay,
  getRandomSticker,
  StickerDef,
} from "@/lib/stickers/stickers";

interface StickerPickerProps {
  onSelectSticker: (stickerId: string) => void;
  onClose: () => void;
}

export function StickerPicker({ onSelectSticker, onClose }: StickerPickerProps) {
  const [activeMood, setActiveMood] = useState<StickerMood | "all" | "daily">("all");
  const todaySticker = getStickerOfTheDay();

  const filteredStickers =
    activeMood === "daily"
      ? [todaySticker]
      : activeMood === "all"
      ? STICKER_PACK
      : STICKER_PACK.filter((s) => s.mood === activeMood);

  const handleSurprise = () => {
    const random = getRandomSticker(activeMood === "daily" ? "all" : activeMood);
    onSelectSticker(random.id);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
      <div className="w-full max-w-[420px] mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[75vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧸</span>
            <h2 className="text-sm font-bold text-slate-800">Bear Sticker Pack</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Surprise Button */}
            <button
              onClick={handleSurprise}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-rose-200/60"
              title="Send a random surprise sticker"
            >
              <Dices className="w-3.5 h-3.5" />
              Surprise!
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Close stickers"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sticker of the Day Banner */}
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-amber-200/80 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={todaySticker.file}
                alt={todaySticker.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Sticker of the Day
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">{todaySticker.name}</p>
              <span className="text-[10px] text-amber-700">Unlocked today only!</span>
            </div>
          </div>

          <button
            onClick={() => onSelectSticker(todaySticker.id)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Send
          </button>
        </div>

        {/* Mood Tabs */}
        <div className="px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMood("daily")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition ${
              activeMood === "daily"
                ? "bg-amber-100 text-amber-800 shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>⭐</span>
            Daily
          </button>

          {MOOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMood(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition ${
                activeMood === tab.id
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto max-h-[45vh]">
          {filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onSelectSticker(sticker.id)}
              className="group aspect-square p-2 bg-slate-50 hover:bg-rose-50/70 border border-slate-100 hover:border-rose-200 rounded-2xl flex flex-col items-center justify-center transition active:scale-95"
            >
              <img
                src={sticker.file}
                alt={sticker.name}
                className="w-full h-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <span className="text-[9px] text-slate-500 font-medium truncate w-full text-center mt-1">
                {sticker.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
