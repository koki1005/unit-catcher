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
  fallbackClassName,
  size = 20,
}: {
  url: string
  className?: string
  fallbackClassName?: string
  size?: number
}) {
  const [errored, setErrored] = useState(false)
  const host = hostnameOf(url)

  if (!host || errored) {
    return <LinkIcon className={cn('text-blue-500', fallbackClassName ?? 'w-5 h-5')} />
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={cn('rounded-sm object-contain', className)}
    />
  )
}
