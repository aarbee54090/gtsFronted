import Image from "next/image"
import type { MediaItem } from "@/lib/gts-hub-types"

interface HubMediaProps {
  media: MediaItem
  className?: string
  width?: number
  height?: number
  /** Used when the admin left the media's own alt text empty - typically the item's title. */
  fallbackAlt?: string
  /** A complete alt text decided by the caller (e.g. projectImageAlt), used as-is. */
  altOverride?: string
  /** Preload - only for the page's main (largest) image above the fold. */
  preload?: boolean
}

export function HubMedia({ media, className, width = 800, height = 600, fallbackAlt, altOverride, preload }: HubMediaProps) {
  const alt = altOverride ?? (media.alt?.trim() || fallbackAlt || "")

  if (media.type === "video") {
    return (
      <video src={media.url} controls preload="metadata" className={className} aria-label={alt || undefined}>
        Your browser doesn&apos;t support embedded video.
      </video>
    )
  }

  if (media.provider === "cloudinary" || /^https:\/\/res\.cloudinary\.com\//.test(media.url)) {
    return (
      <Image
        src={media.url}
        alt={alt}
        width={width}
        height={height}
        preload={preload}
        sizes={`(max-width: 640px) 100vw, ${width}px`}
        className={className}
      />
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt={alt} loading={preload ? "eager" : "lazy"} decoding="async" className={className} />
}
