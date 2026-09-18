import Image from "next/image"
import type { MediaItem } from "@/lib/gts-hub-types"

interface HubMediaProps {
  media: MediaItem
  className?: string
  width?: number
  height?: number
}

export function HubMedia({ media, className, width = 800, height = 600 }: HubMediaProps) {
  if (media.type === "video") {
    return (
      <video src={media.url} controls className={className} aria-label={media.alt}>
        Your browser doesn&apos;t support embedded video.
      </video>
    )
  }

  if (media.provider === "cloudinary") {
    return (
      <Image
        src={media.url}
        alt={media.alt || ""}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt={media.alt || ""} className={className} />
}
