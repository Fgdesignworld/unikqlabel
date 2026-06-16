import { useState, useCallback } from 'react'
import {
  compressIfNeeded,
  fmtSize,
  type CompressOptions,
} from '@/lib/compress-image'

export type CompressStatus = 'idle' | 'compressing' | 'uploading' | 'done' | 'error'

export interface UseImageCompressReturn {
  /** Current status of the upload pipeline */
  status: CompressStatus
  /** Human-readable compression feedback, e.g. "2.1 MB → 263 KB" */
  info: string | null
  /** Whether any async operation is in flight */
  busy: boolean
  /** Compress the file (if needed) and return the result */
  compress: (file: File) => Promise<File>
  /** Call before the HTTP upload begins */
  markUploading: () => void
  /** Call after the HTTP upload succeeds */
  markDone: () => void
  /** Call on any error; optionally provide a message */
  markError: (msg?: string) => void
  /** Reset back to idle */
  reset: () => void
}

/**
 * useImageCompress — thin React wrapper around compressIfNeeded.
 *
 * Usage:
 *   const img = useImageCompress({ maxSizeKB: 300 })
 *
 *   const handleChange = async (e) => {
 *     const file = e.target.files?.[0]; if (!file) return
 *     const compressed = await img.compress(file)
 *     img.markUploading()
 *     try {
 *       const url = await someService.uploadImage(compressed)
 *       img.markDone()
 *       setImageUrl(url)
 *     } catch { img.markError() }
 *   }
 *
 *   // In JSX, show img.info to display "1.4 MB → 280 KB"
 */
export function useImageCompress(
  options?: CompressOptions
): UseImageCompressReturn {
  const [status, setStatus] = useState<CompressStatus>('idle')
  const [info, setInfo] = useState<string | null>(null)

  const compress = useCallback(
    async (file: File): Promise<File> => {
      setStatus('compressing')
      setInfo(null)

      const result = await compressIfNeeded(file, options)

      if (result.wasCompressed) {
        setInfo(
          `${fmtSize(result.originalSizeKB)} → ${fmtSize(result.compressedSizeKB)}`
        )
      }

      setStatus('idle')
      return result.file
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.maxSizeKB, options?.maxWidthPx, options?.initialQuality]
  )

  const markUploading = useCallback(() => setStatus('uploading'), [])

  const markDone = useCallback(() => {
    setStatus('done')
    // Clear the "done" state after 4 s so it doesn't linger
    setTimeout(() => setStatus('idle'), 4000)
  }, [])

  const markError = useCallback((msg?: string) => {
    setStatus('error')
    if (msg) setInfo(msg)
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setInfo(null)
  }, [])

  return {
    status,
    info,
    busy: status === 'compressing' || status === 'uploading',
    compress,
    markUploading,
    markDone,
    markError,
    reset,
  }
}
