'use client'

import { useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

type Props = {
  onDetected: (url: string) => void
}

export default function QrUpload({ onDetected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File) => {
    setError(null)
    setLoading(true)
    const id = 'qr-upload-' + Math.random().toString(36).slice(2)
    const div = document.createElement('div')
    div.id = id
    div.style.display = 'none'
    document.body.appendChild(div)
    try {
      const scanner = new Html5Qrcode(id)
      const result = await scanner.scanFile(file, false)
      onDetected(result)
    } catch {
      setError('QRコードを検出できませんでした')
    } finally {
      document.getElementById(id)?.remove()
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">タップして画像を選択</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {loading && <p className="text-sm text-center text-muted-foreground">読み取り中...</p>}
      {error && <p className="text-sm text-center text-destructive">{error}</p>}
    </div>
  )
}
