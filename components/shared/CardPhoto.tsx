"use client"

import { useState } from "react"
import Image from "next/image"
import { Pencil } from "lucide-react"

interface CardPhotoProps {
  src?: string
  alt: string
  sizes: string
  className?: string
}

// Used inside a `relative` card container. Falls back to a styled "no photo
// yet" placeholder both when no URL is set AND when the URL fails to load
// (a stale/broken Cloudinary link) - next/image doesn't retry or hide itself
// on a load error by default, so without this it shows the browser's raw
// broken-image icon.
export function CardPhoto({ src, alt, sizes, className }: CardPhotoProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "radial-gradient(circle at 50% 30%, rgba(182,255,0,0.08), transparent 70%)" }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
          <Pencil className="h-4 w-4" />
        </span>
      </div>
    )
  }

  return <Image src={src} alt={alt} fill sizes={sizes} className={className} onError={() => setFailed(true)} />
}
