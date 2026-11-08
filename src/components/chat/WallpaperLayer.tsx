"use client";

import React, { useEffect, useState } from "react";
import { WallpaperRecord, WALLPAPER_PRESETS } from "@/lib/wallpaper/types";

interface WallpaperLayerProps {
  wallpaper: WallpaperRecord | null;
}

export function WallpaperLayer({ wallpaper }: WallpaperLayerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (wallpaper?.type === "custom" && wallpaper.bakedBlob) {
      const url = URL.createObjectURL(wallpaper.bakedBlob);
      setBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setBlobUrl(null);
    }
  }, [wallpaper]);

  if (!wallpaper) return null;

  if (wallpaper.type === "preset" && wallpaper.presetId) {
    const preset = WALLPAPER_PRESETS.find((p) => p.id === wallpaper.presetId);
    if (!preset) return null;

    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: preset.cssGradient,
          opacity: 1,
        }}
      >
        {/* Dimming overlay if needed */}
        {wallpaper.dim > 0 && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${wallpaper.dim})` }}
          />
        )}
      </div>
    );
  }

  if (wallpaper.type === "custom" && blobUrl) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src={blobUrl}
          alt="Chat Wallpaper"
          className="w-full h-full object-cover"
        />
        {/* Additional runtime dim overlay */}
        {wallpaper.dim > 0 && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${wallpaper.dim})` }}
          />
        )}
      </div>
    );
  }

  return null;
}
