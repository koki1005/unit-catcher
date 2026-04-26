'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type Props = {
  onDetected: (url: string) => void
}

export default function QrCamera({ onDetected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const id = 'qr-reader-' + Math.random().toString(36).slice(2)
    if (!containerRef.current) return
    containerRef.current.id = id

    const scanner = new Html5Qrcode(id)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        scanner.stop().catch(() => {})
        onDetected(decodedText)
      },
      undefined
    ).then(() => setStarted(true))
      .catch(() => setError('カメラのアクセスが拒否されました'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onDetected])

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-destructive text-sm text-center">{error}</p>
      ) : (
        <p className="text-muted-foreground text-sm text-center">QRコードをカメラに向けてください</p>
      )}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden" />
    </div>
  )
}
