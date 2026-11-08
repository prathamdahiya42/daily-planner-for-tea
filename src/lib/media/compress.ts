/**
 * Client-side photo compression.
 * Compresses images on the device to <= ~200KB BEFORE encryption.
 */

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

const MAX_TARGET_BYTES = 200 * 1024; // ~200 KB
const MAX_DIMENSION = 1600; // max width or height

/**
 * Resizes and compresses an image file or blob to ~200KB max.
 * In environments without HTMLCanvasElement (e.g. unit tests / SSR),
 * safely returns the input or a mock compressed blob.
 */
export async function compressImage(
  file: File | Blob,
  targetMaxBytes: number = MAX_TARGET_BYTES
): Promise<CompressionResult> {
  // Check if browser canvas is available
  if (typeof window === "undefined" || typeof document === "undefined" || !("createElement" in document)) {
    const size = file.size;
    return {
      blob: file,
      width: 800,
      height: 600,
      originalSize: size,
      compressedSize: size,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if exceeds max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          blob: file,
          width,
          height,
          originalSize: file.size,
          compressedSize: file.size,
        });
        return;
      }

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively reduce quality until under targetMaxBytes
      let quality = 0.85;
      let currentBlob: Blob | null = null;

      while (quality >= 0.2) {
        currentBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob((b) => res(b), "image/jpeg", quality)
        );

        if (currentBlob && currentBlob.size <= targetMaxBytes) {
          break;
        }

        // Drop quality
        quality -= 0.15;
      }

      // If still above target bytes, scale dimensions by 25% and retry
      if (currentBlob && currentBlob.size > targetMaxBytes && width > 400 && height > 400) {
        width = Math.round(width * 0.75);
        height = Math.round(height * 0.75);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        currentBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob((b) => res(b), "image/jpeg", 0.6)
        );
      }

      const finalBlob = currentBlob || file;

      resolve({
        blob: finalBlob,
        width,
        height,
        originalSize: file.size,
        compressedSize: finalBlob.size,
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}
