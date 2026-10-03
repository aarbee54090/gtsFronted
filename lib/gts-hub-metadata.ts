import type { Metadata } from "next"
import type { ContentType, MediaItem, SeoFields } from "./gts-hub-types"
import { HUB_BASE_PATH } from "./gts-hub-card-helpers"
import { brandTitle, pageMetadata, toMetaDescription, usableImageUrl } from "./seo"
import type { Crumb } from "./structured-data"

type ImageSource = MediaItem | string | undefined

/** First usable image URL - videos, empty values, and non-URL text are skipped. */
export function firstImageUrl(sources: ImageSource[]): string | undefined {
  for (const source of sources) {
    if (!source) continue
    const url =
      typeof source === "string"
        ? usableImageUrl(source)
        : source.type === "image"
          ? usableImageUrl(source.url)
          : undefined
    if (url) return url
  }
  return undefined
}

/**
 * The admin's SEO description is used as written (whitespace tidied);
 * otherwise the fallback - excerpt or body copy - is trimmed to snippet length.
 */
export function hubDescription(seo: SeoFields | undefined, fallback: string | undefined): string | undefined {
  return toMetaDescription(seo?.description, Infinity) ?? toMetaDescription(fallback)
}

/**
 * Builds per-page metadata for CMS-backed pages (GTS Hub content, About,
 * Contact): the admin's SEO fields win, otherwise it falls back to the
 * content's own title, excerpt, and images. The SEO image field is free text,
 * so a value that isn't actually an image URL is skipped, not published.
 */
export function buildMetadata(params: {
  seo?: SeoFields
  fallbackTitle: string
  fallbackDescription?: string
  /** Canonical path, e.g. /gts-hub/journal/<slug> */
  path: string
  /** Content images to fall back on, most representative first. */
  images?: ImageSource[]
  article?: { publishedTime?: string; modifiedTime?: string; section?: string }
}): Metadata {
  const title = params.seo?.title?.trim() || brandTitle(params.fallbackTitle)
  const imageUrl = firstImageUrl([params.seo?.ogImage, ...(params.images ?? [])])

  return pageMetadata({
    title,
    description: hubDescription(params.seo, params.fallbackDescription),
    path: params.path,
    images: imageUrl ? [{ url: imageUrl, alt: params.fallbackTitle }] : undefined,
    article: params.article,
  })
}

// The customer-facing name of each hub section ("portfolio" is "Our Work"
// on the site; the URL and CMS key stay /gts-hub/portfolio).
export const HUB_SECTION_NAME: Record<ContentType, string> = {
  portfolio: "Our Work",
  journal: "Journal",
  "new-arrival": "New Arrivals",
  material: "Materials",
}

/** GTS Hub > <section> - the trail above a hub section's list and detail pages. */
export function hubTrail(contentType: ContentType): Crumb[] {
  return [
    { name: "GTS Hub", path: "/gts-hub" },
    { name: HUB_SECTION_NAME[contentType], path: HUB_BASE_PATH[contentType] },
  ]
}
