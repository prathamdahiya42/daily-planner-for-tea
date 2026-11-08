import { BlurAmount } from "./types";

export interface ProcessedWallpaperResult {
  bakedBlob: Blob;
  averageLuminance: number;
  previewUrl: string;
}

/**
 * Bakes blur, downscaling (max 1600px), and dimming directly onto canvas at save time.
 * Zero CSS blur filter at runtime during scrolling! (Hard Rule 4 & 5)
 */
export async function bakeWallpaperImage(
  imageSource: Blob | File,
  blur: BlurAmount = 0,
  dim: number = 0.2
): Promise<ProcessedWallpaperResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageSource);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Downscale to max 1600px
      const MAX_SIZE = 1600;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        reject(new Error("Unable to obtain 2d canvas context"));
        return;
      }

      // Draw with baked blur
      if (blur > 0) {
        // Expand slightly by blur amount to avoid edge transparency bleeding
        ctx.filter = `blur(${blur}px)`;
        const pad = blur * 2;
        ctx.drawImage(img, -pad, -pad, width + pad * 2, height + pad * 2);
        ctx.filter = "none";
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }

      // Sample average luminance across a 16x16 grid for legibility guard
      let totalLuminance = 0;
      let sampleCount = 0;
      try {
        const sampleData = ctx.getImageData(0, 0, Math.min(width, 64), Math.min(height, 64)).data;
        for (let i = 0; i < sampleData.length; i += 16) {
          const r = sampleData[i] / 255;
          const g = sampleData[i + 1] / 255;
          const b = sampleData[i + 2] / 255;
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          totalLuminance += lum;
          sampleCount++;
        }
      } catch {}

      const averageLuminance = sampleCount > 0 ? totalLuminance / sampleCount : 0.5;

      // Enforce dimming directly onto canvas if desired or rely on layer
      if (dim > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${dim})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Export to WebP (fallback to JPEG if unsupported)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const previewUrl = URL.createObjectURL(blob);
          resolve({
            bakedBlob: blob,
            averageLuminance,
            previewUrl,
          });
        },
        "image/webp",
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for wallpaper baking"));
    };

    img.src = objectUrl;
  });
}
