/**
 * compress-image.ts
 * Pure canvas-based client-side image compression.
 *
 * Strategy:
 *  1. Load image via HTMLImageElement.
 *  2. If dimensions exceed maxWidthPx, scale down proportionally.
 *  3. Encode as JPEG (or WebP for PNGs to preserve alpha) starting at
 *     initialQuality, reducing by 0.07 per step until the blob fits
 *     within maxSizeKB, down to a floor of 0.25.
 *  4. Return a new File object ready to pass to any upload service.
 *
 * Size thresholds used by the app:
 *  - Products / Categories / Gallery: maxSizeKB = 300, maxWidthPx = 2000
 *  - Hero slides:                     maxSizeKB = 400, maxWidthPx = 2400
 */

export interface CompressOptions {
  /** Target max file size in KB. Default: 300 */
  maxSizeKB?: number
  /** Max width OR height in pixels. Default: 2000 */
  maxWidthPx?: number
  /** Starting encode quality (0–1). Default: 0.92 */
  initialQuality?: number
  /** Output MIME. Default: auto ('image/jpeg', or 'image/webp' for PNGs) */
  outputType?: 'image/jpeg' | 'image/webp'
}

export interface CompressResult {
  /** The compressed (or original) File */
  file: File
  /** Original file size in KB */
  originalSizeKB: number
  /** Resulting file size in KB */
  compressedSizeKB: number
  /** True when the output is smaller than the input */
  wasCompressed: boolean
  /** Final rendered canvas dimensions */
  finalDimensions: { width: number; height: number }
}

/** Compress an image File using the Canvas API. */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxSizeKB = 300,
    maxWidthPx = 2000,
    initialQuality = 0.92,
    outputType,
  } = options

  const originalSizeKB = file.size / 1024
  const maxSizeBytes = maxSizeKB * 1024

  // Preserve transparency: use WebP for PNGs unless caller overrides
  const mime: string =
    outputType ?? (file.type === 'image/png' ? 'image/webp' : 'image/jpeg')

  return new Promise<CompressResult>((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)

      let w = img.naturalWidth
      let h = img.naturalHeight

      // ── Scale down oversized images ──────────────────────────────────────
      if (w > maxWidthPx || h > maxWidthPx) {
        const ratio = Math.min(maxWidthPx / w, maxWidthPx / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'))
        return
      }

      // White background fills transparent pixels for JPEG output
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
      }
      ctx.drawImage(img, 0, 0, w, h)

      // ── Quality iteration until size fits ────────────────────────────────
      let quality = initialQuality
      let blob: Blob | null = null

      for (let attempt = 0; attempt < 14; attempt++) {
        blob = await new Promise<Blob | null>(res =>
          canvas.toBlob(res, mime, quality)
        )
        if (!blob) break
        if (blob.size <= maxSizeBytes) break
        quality = Math.max(0.25, quality - 0.07)
      }

      if (!blob) {
        reject(new Error('Canvas toBlob returned null'))
        return
      }

      const ext = mime === 'image/webp' ? '.webp' : '.jpg'
      const baseName = file.name.replace(/\.[^.]+$/, '')
      const compressedFile = new File([blob], `${baseName}${ext}`, {
        type: mime,
        lastModified: Date.now(),
      })

      resolve({
        file: compressedFile,
        originalSizeKB: Math.round(originalSizeKB),
        compressedSizeKB: Math.round(blob.size / 1024),
        wasCompressed: blob.size < file.size,
        finalDimensions: { width: w, height: h },
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = objectUrl
  })
}

/**
 * Compress only when the file exceeds the size threshold.
 * Returns original File (wrapped in a CompressResult) if already small enough.
 */
export async function compressIfNeeded(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const { maxSizeKB = 300 } = options

  if (file.size <= maxSizeKB * 1024) {
    return {
      file,
      originalSizeKB: Math.round(file.size / 1024),
      compressedSizeKB: Math.round(file.size / 1024),
      wasCompressed: false,
      finalDimensions: { width: 0, height: 0 },
    }
  }

  return compressImage(file, options)
}

/** Human-readable size label: "1.4 MB" or "320 KB" */
export function fmtSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${Math.round(kb)} KB`
}
