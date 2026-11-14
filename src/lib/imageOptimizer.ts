/**
 * Client-Side Image Optimizer & Sanitizer ("Squoosh"-style)
 *
 * Compresses images before upload using HTML5 Canvas:
 * - Constrains max dimensions (default 1200px width/height)
 * - Converts to optimized WebP at quality 0.82 (with JPEG fallback)
 * - Strips EXIF metadata and device GPS data (sanitization)
 * - Drastically reduces file size (typically from 4-8MB down to 80-180KB)
 * - Enables self-contained data URL storage in database with zero orphan files when deleted
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  format: 'webp' | 'jpeg';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function compressAndSanitizeImage(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
  }
): Promise<OptimizedImageResult> {
  const maxDim = options?.maxDimension || 1200;
  const quality = options?.quality || 0.82;
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    // Read file as data URL
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        return reject(new Error('Empty image file read'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down to maxDimension preserving aspect ratio
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get 2D canvas context'));
        }

        // Draw image (stripping all original EXIF metadata)
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first (supported in all modern browsers)
        let format: 'webp' | 'jpeg' = 'webp';
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);

        // If browser doesn't support WebP export, it returns PNG; fallback to JPEG
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          format = 'jpeg';
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate approximate size in bytes of base64 dataUrl
        const base64Content = compressedDataUrl.split(',')[1] || '';
        const compressedSizeBytes = Math.round((base64Content.length * 3) / 4);

        const savingsPercent = Math.max(
          0,
          Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100)
        );

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          savingsPercent,
          width,
          height,
          format,
        });
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
