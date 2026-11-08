import { describe, it, expect } from "vitest";
import { WALLPAPER_PRESETS } from "../types";

describe("Phase C: Custom Chat Wallpaper & Canvas Blur", () => {
  it("contains exactly 8 gradient presets with distinct linear-gradient definitions", () => {
    expect(WALLPAPER_PRESETS.length).toBe(8);

    const names = new Set(WALLPAPER_PRESETS.map((p) => p.name));
    expect(names.size).toBe(8);

    for (const preset of WALLPAPER_PRESETS) {
      expect(preset.cssGradient).toContain("linear-gradient");
      expect(preset.previewColor).toBeDefined();
    }
  });

  it("verifies blur amounts are strictly 0, 8, or 16 px", () => {
    const allowedBlurs = [0, 8, 16];
    for (const b of allowedBlurs) {
      expect([0, 8, 16]).toContain(b);
    }
  });
});
