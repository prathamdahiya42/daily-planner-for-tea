"use client";

import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Sparkles, Sliders, Check, Trash2, Camera, Loader2, Send } from "lucide-react";
import { WallpaperRecord, WALLPAPER_PRESETS, BlurAmount } from "@/lib/wallpaper/types";
import { bakeWallpaperImage } from "@/lib/wallpaper/process";

interface WallpaperModalProps {
  currentWallpaper: WallpaperRecord | null;
  onSave: (record: WallpaperRecord | null, shareWithPartner: boolean) => Promise<void>;
  onClose: () => void;
}

export function WallpaperModal({ currentWallpaper, onSave, onClose }: WallpaperModalProps) {
  const [selectedType, setSelectedType] = useState<"preset" | "custom">(
    currentWallpaper?.type || "preset"
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    currentWallpaper?.presetId || "romantic-dawn"
  );
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(currentWallpaper?.bakedBlob || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [blur, setBlur] = useState<BlurAmount>(currentWallpaper?.blur ?? 0);
  const [dim, setDim] = useState<number>(currentWallpaper?.dim ?? 0.15);
  const [shareWithPartner, setShareWithPartner] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedType("preset");
    setSelectedPresetId(presetId);
  };

  const handleCustomFile = async (file: File) => {
    setCustomFile(file);
    setSelectedType("custom");
    setIsProcessing(true);
    try {
      const res = await bakeWallpaperImage(file, blur, dim);
      setPreviewBlob(res.bakedBlob);
      setPreviewUrl(res.previewUrl);
    } catch (err) {
      console.error("Failed to bake custom wallpaper:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlurChange = async (newBlur: BlurAmount) => {
    setBlur(newBlur);
    if (customFile) {
      setIsProcessing(true);
      try {
        const res = await bakeWallpaperImage(customFile, newBlur, dim);
        setPreviewBlob(res.bakedBlob);
        setPreviewUrl(res.previewUrl);
      } catch (err) {
        console.error("Failed to re-bake with new blur:", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDimChange = (val: number) => {
    setDim(val);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    if (selectedType === "preset") {
      const record: WallpaperRecord = {
        id: `preset-${selectedPresetId}`,
        type: "preset",
        presetId: selectedPresetId,
        blur,
        dim,
        createdAt: Date.now(),
      };
      await onSave(record, shareWithPartner);
    } else if (previewBlob) {
      const record: WallpaperRecord = {
        id: `custom-${Date.now()}`,
        type: "custom",
        bakedBlob: previewBlob,
        blur,
        dim,
        createdAt: Date.now(),
      };
      await onSave(record, shareWithPartner);
    }
    setIsProcessing(false);
    onClose();
  };

  const handleRemove = async () => {
    await onSave(null, false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-plum/50 backdrop-blur-xs flex flex-col justify-end select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] mx-auto bg-surface rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t border-blush/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-full pt-3 pb-1 flex items-center justify-center">
          <div className="w-10 h-1.5 rounded-full bg-blush" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-blush/40">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-crimson" />
            <h2 className="text-base font-display font-bold text-plum">Chat Wallpaper</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {currentWallpaper && (
              <button
                onClick={handleRemove}
                className="px-2.5 py-1 text-xs font-hand text-rose hover:text-crimson rounded-xl transition flex items-center gap-1"
                title="Remove wallpaper"
                aria-label="Remove wallpaper"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-plum-soft hover:text-plum rounded-2xl transition"
              aria-label="Close wallpaper modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCustomFile(f);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCustomFile(f);
          }}
        />

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Preset Gradients (8 Presets) */}
          <div className="space-y-2">
            <span className="text-xs font-display font-semibold text-plum-soft">Gradient Presets</span>
            <div className="grid grid-cols-4 gap-2.5">
              {WALLPAPER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`h-16 rounded-2xl border flex flex-col items-center justify-end p-1.5 transition active:scale-95 relative overflow-hidden shadow-xs ${
                    selectedType === "preset" && selectedPresetId === preset.id
                      ? "ring-2 ring-crimson border-crimson"
                      : "border-blush/60"
                  }`}
                  style={{ background: preset.cssGradient }}
                >
                  {selectedType === "preset" && selectedPresetId === preset.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-crimson text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <span className="text-[10px] font-hand font-semibold text-plum drop-shadow-xs truncate max-w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Photo Options */}
          <div className="space-y-2">
            <span className="text-xs font-display font-semibold text-plum-soft">Custom Photo</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-2xl border flex items-center gap-2 transition active:scale-95 ${
                  selectedType === "custom"
                    ? "border-crimson bg-cream-2/70 text-crimson"
                    : "border-blush/60 bg-cream-2/30 text-plum hover:bg-cream-2/50"
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0 text-berry" />
                <span className="text-xs font-bold">Choose Photo</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-3 rounded-2xl border border-blush/60 bg-cream-2/30 hover:bg-cream-2/50 text-plum flex items-center gap-2 transition active:scale-95"
              >
                <Camera className="w-4 h-4 shrink-0 text-rose" />
                <span className="text-xs font-bold">Take Photo</span>
              </button>
            </div>
          </div>

          {/* Blur & Dim Controls */}
          <div className="space-y-4 pt-1 border-t border-blush/40">
            {/* Blur selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-semibold text-plum-soft">Canvas Blur</span>
              <div className="flex items-center gap-1.5 p-1 bg-cream-2 rounded-xl border border-blush/50">
                {([0, 8, 16] as BlurAmount[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBlurChange(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      blur === b
                        ? "bg-surface text-crimson shadow-xs border border-blush/60"
                        : "text-plum-soft hover:text-plum"
                    }`}
                  >
                    {b === 0 ? "Off" : `${b}px`}
                  </button>
                ))}
              </div>
            </div>

            {/* Dim slider (0% to 70%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display font-semibold text-plum-soft">Dimming Overlay</span>
                <span className="font-mono text-plum">{Math.round(dim * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.70"
                step="0.05"
                value={dim}
                onChange={(e) => handleDimChange(parseFloat(e.target.value))}
                className="w-full accent-crimson cursor-pointer"
              />
            </div>

            {/* Share with partner toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-cream-2/50 border border-blush/60 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-plum">Share with partner</span>
                <span className="text-[11px] font-hand text-rose">
                  Notify them so they can match wallpapers 💕
                </span>
              </div>
              <input
                type="checkbox"
                checked={shareWithPartner}
                onChange={(e) => setShareWithPartner(e.target.checked)}
                className="w-4 h-4 accent-crimson rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Action button */}
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-crimson to-berry text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-soft hover:opacity-95 active:scale-98 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Apply Wallpaper</span>
          </button>
        </div>
      </div>
    </div>
  );
}
