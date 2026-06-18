'use client'

import { useState } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export function Favicon({
  url,
  className,
  iconClassName,
  size = 20,
}: {
  url: string
  className?: string
  iconClassName?: string
  size?: number
}) {
  const [errored, setErrored] = useState(false)
  const host = hostnameOf(url)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-white ring-2 ring-blue-500/60 shadow-sm shrink-0',
        className,
      )}
      style={{ width: size + 12, height: size + 12 }}
    >
      {!host || errored ? (
        <LinkIcon className={cn('text-blue-500', iconClassName)} style={{ width: size, height: size }} />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="rounded-sm object-contain"
        />
      )}
    </span>
  )
}
