"use client";

import React, { useState, useMemo } from "react";
import { X, Sun, Moon, Sparkles, Check, RotateCcw, Palette } from "lucide-react";
import { StyleType, ModeType, UserThemePrefs, PRESET_ACCENTS, DEFAULT_THEME_PREFS } from "@/lib/theme/types";
import { deriveTheme } from "@/lib/theme/deriveTheme";
import { resolveActiveMode } from "@/lib/theme/storage";
import { Sticker } from "./Sticker";

interface AppearanceModalProps {
  prefs: UserThemePrefs;
  onSavePrefs: (newPrefs: UserThemePrefs) => void;
  onClose: () => void;
}

export function AppearanceModal({ prefs, onSavePrefs, onClose }: AppearanceModalProps) {
  const [currentPrefs, setCurrentPrefs] = useState<UserThemePrefs>(prefs);
  const [customHex, setCustomHex] = useState(prefs.accent);

  const activeMode = resolveActiveMode(currentPrefs.mode);
  const previewTokens = useMemo(() => {
    return deriveTheme(currentPrefs.accent, activeMode, currentPrefs.style);
  }, [currentPrefs.accent, activeMode, currentPrefs.style]);

  const handleUpdate = (updates: Partial<UserThemePrefs>) => {
    const next = { ...currentPrefs, ...updates };
    setCurrentPrefs(next);
    onSavePrefs(next);
  };

  const handleColorChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      handleUpdate({ accent: hex });
    }
  };

  const handleReset = () => {
    setCurrentPrefs(DEFAULT_THEME_PREFS);
    setCustomHex(DEFAULT_THEME_PREFS.accent);
    onSavePrefs(DEFAULT_THEME_PREFS);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-plum/50 backdrop-blur-xs flex flex-col justify-end select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] mx-auto bg-surface rounded-t-[32px] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-t border-blush/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-full pt-3 pb-1 flex items-center justify-center">
          <div className="w-10 h-1.5 rounded-full bg-blush" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-blush/40">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-crimson" />
            <h2 className="text-base font-display font-bold text-plum">Theme & Style</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-hand text-rose hover:text-crimson rounded-xl transition flex items-center gap-1"
              title="Reset to default theme"
              aria-label="Reset theme"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-plum-soft hover:text-plum rounded-2xl transition"
              aria-label="Close theme options"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Live Mini-Chat Preview */}
          <div className="space-y-1.5">
            <span className="text-xs font-display font-semibold text-plum-soft">Live Preview</span>
            <div
              className={`w-full rounded-2xl p-3 border transition-colors duration-300 relative overflow-hidden ${previewTokens.pattern}`}
              style={{
                backgroundColor: previewTokens.cream,
                borderColor: previewTokens.border,
              }}
            >
              {/* Mini Header */}
              <div
                className="flex items-center justify-between pb-2 mb-2 border-b"
                style={{ borderColor: previewTokens.blush }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: previewTokens.crimson, color: "#fff" }}
                  >
                    ❤️
                  </div>
                  <span className="text-xs font-display font-bold" style={{ color: previewTokens.plum }}>
                    Our Little Room
                  </span>
                </div>
                <span className="text-[10px] font-hand font-semibold" style={{ color: previewTokens.statusOnline }}>
                  ● she's here ✨
                </span>
              </div>

              {/* Mini Bubbles */}
              <div className="space-y-2 text-xs font-body">
                {/* Date chip */}
                <div className="flex justify-center">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-display italic border"
                    style={{
                      backgroundColor: previewTokens.surface,
                      borderColor: previewTokens.blush,
                      color: previewTokens.plumSoft,
                    }}
                  >
                    Today
                  </span>
                </div>

                {/* Partner Bubble */}
                <div className="flex justify-start">
                  <div
                    className="px-3 py-1.5 rounded-2xl rounded-bl-sm border max-w-[80%] shadow-xs"
                    style={{
                      backgroundColor: previewTokens.surface,
                      borderColor: previewTokens.blush,
                      color: previewTokens.plum,
                    }}
                  >
                    <span>Good morning sweetheart ☕</span>
                    <div className="text-[9px] text-right font-hand mt-0.5" style={{ color: previewTokens.plumSoft }}>
                      9:41 AM
                    </div>
                  </div>
                </div>

                {/* Own Bubble */}
                <div className="flex justify-end">
                  <div
                    className="px-3 py-1.5 rounded-2xl rounded-br-sm max-w-[80%] text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${previewTokens.crimson}, ${previewTokens.berry})`,
                    }}
                  >
                    <span>Can't wait to talk to you! 💕</span>
                    <div className="text-[9px] text-right font-hand mt-0.5 text-white/80">
                      9:42 AM • ❤️
                    </div>
                  </div>
                </div>

                {/* Mini Sticker */}
                <div className="flex justify-start">
                  <Sticker payload="noto-bear" size="small" />
                </div>
              </div>
            </div>
          </div>

          {/* Style Selector (3 Switchable Styles) */}
          <div className="space-y-2">
            <span className="text-xs font-display font-semibold text-plum-soft">Visual Style</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "cozy" as StyleType, name: "Cozy Blush", desc: "Warm & romantic" },
                { id: "glow" as StyleType, name: "Midnight Glow", desc: "OLED neon glow" },
                { id: "paper" as StyleType, name: "Paper Diary", desc: "Vintage parchment" },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleUpdate({ style: style.id })}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    currentPrefs.style === style.id
                      ? "border-crimson bg-cream-2/70 shadow-xs ring-2 ring-crimson/20"
                      : "border-blush/60 bg-cream-2/30 hover:bg-cream-2/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-display font-bold text-plum">{style.name}</span>
                    {currentPrefs.style === style.id && (
                      <Check className="w-3.5 h-3.5 text-crimson" />
                    )}
                  </div>
                  <span className="text-[10px] text-plum-soft font-hand">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switch (Light / Dark / Auto) */}
          <div className="space-y-2">
            <span className="text-xs font-display font-semibold text-plum-soft">Appearance Mode</span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-cream-2 rounded-2xl border border-blush/50">
              {[
                { id: "light" as ModeType, label: "Light", icon: Sun },
                { id: "dark" as ModeType, label: "Dark", icon: Moon },
                { id: "auto" as ModeType, label: "Auto", icon: Sparkles },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleUpdate({ mode: id })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    currentPrefs.mode === id
                      ? "bg-surface text-crimson shadow-xs border border-blush/60"
                      : "text-plum-soft hover:text-plum"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Accent Color Palette */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-semibold text-plum-soft">Accent Color</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={currentPrefs.accent}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                  title="Pick custom color"
                />
                <input
                  type="text"
                  value={customHex}
                  maxLength={7}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#D12E53"
                  className="w-20 px-2 py-0.5 text-xs font-mono rounded-lg border border-blush bg-cream-2 text-plum uppercase"
                />
              </div>
            </div>

            {/* Curated Swatches */}
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_ACCENTS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => handleColorChange(preset.hex)}
                  className="h-11 rounded-2xl flex items-center justify-center transition active:scale-95 border border-white/20 relative shadow-xs"
                  style={{ backgroundColor: preset.hex }}
                  title={preset.label}
                  aria-label={preset.label}
                >
                  {currentPrefs.accent.toLowerCase() === preset.hex.toLowerCase() && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
