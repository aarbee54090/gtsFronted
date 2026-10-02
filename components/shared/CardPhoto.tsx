"use client"

import { useState } from "react"
import Image, { getImageProps } from "next/image"
import { Pencil } from "lucide-react"
import { cleanImageUrl, distinctMobileUrl } from "@/lib/images"

// Phones are below Tailwind's `sm` breakpoint; the same boundary the card
// layouts switch at, so each layout gets the crop that was made for it.
const MOBILE_MAX_WIDTH = 639

interface CardPhotoProps {
  src?: string
  alt: string
  /** `sizes` for the (desktop) image. */
  sizes: string
  /**
   * Optional separate crop for phones - e.g. a wide image for a wide mobile
   * card. Served through <picture>, so a phone downloads only this one and a
   * larger screen only `src`.
   */
  mobileSrc?: string
  /** `sizes` for the mobile image (defaults to the full viewport width). */
  mobileSizes?: string
  className?: string
}

// Used inside a `relative` container (the image fills it). Falls back to a
// styled "no photo yet" placeholder both when no URL is set AND when the URL
// fails to load (a stale/broken Cloudinary link) - next/image doesn't retry
// or hide itself on a load error by default, so without this it shows the
// browser's raw broken-image icon.
export function CardPhoto({ src, alt, sizes, mobileSrc, mobileSizes = "100vw", className }: CardPhotoProps) {
  const [failed, setFailed] = useState(false)
  const desktop = cleanImageUrl(src) ?? cleanImageUrl(mobileSrc)
  const mobile = distinctMobileUrl(desktop, mobileSrc)

  if (!desktop || failed) {
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

  if (!mobile) {
    return (
      <Image src={desktop} alt={alt} fill sizes={sizes} className={className} onError={() => setFailed(true)} />
    )
  }

  // Art direction: one <img>, two sources. The browser picks by viewport
  // width before downloading, so only one of the two crops is ever fetched.
  const common = { alt, fill: true }
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: desktop, sizes })
  const {
    props: { srcSet: mobileSrcSet, ...img },
  } = getImageProps({ ...common, src: mobile, sizes: mobileSizes })

  return (
    <picture>
      <source media={`(min-width: ${MOBILE_MAX_WIDTH + 1}px)`} srcSet={desktopSrcSet} sizes={sizes} />
      {/* Props from next/image's getImageProps: optimized srcSet, fill styles, lazy loading. */}
      <img {...img} srcSet={mobileSrcSet} alt={alt} className={className} onError={() => setFailed(true)} />
    </picture>
  )
}
