'use client'

import { useEffect, useState } from 'react'

// 画像URLから平均輝度を返す。0〜255。CORSやload失敗時はnull（呼び側で白扱い）。
export function useImageLuminance(url: string | null | undefined): number | null {
  const [luminance, setLuminance] = useState<number | null>(null)

  useEffect(() => {
    if (!url) {
      setLuminance(null)
      return
    }

    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const SIZE = 16
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setLuminance(null)
          return
        }
        ctx.drawImage(img, 0, 0, SIZE, SIZE)
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data
        let total = 0
        const px = data.length / 4
        for (let i = 0; i < data.length; i += 4) {
          total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        }
        setLuminance(total / px)
      } catch {
        // CORS失敗等は静かにnullに戻す
        setLuminance(null)
      }
    }
    img.onerror = () => {
      if (!cancelled) setLuminance(null)
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url])

  return luminance
}

// 輝度から適応的なクラスを返す。luminance null は明るい背景扱い。
// しきい値は経験則の140（white/blackバランス調整済み）。
export function adaptiveTextClasses(luminance: number | null): {
  text: string
  bg: string
} {
  const dark = (luminance ?? 200) < 140
  return dark
    ? { text: 'text-white', bg: 'bg-black/45 backdrop-blur-md backdrop-saturate-150 shadow-sm' }
    : { text: 'text-black', bg: 'bg-white/70 backdrop-blur-md backdrop-saturate-150 shadow-sm' }
}
