import type { Metadata } from "next"
import type { SeoFields } from "./gts-hub-types"

/**
 * Builds real per-page <title>/description/og:image metadata, falling back
 * to the content's own title/excerpt when the admin hasn't filled in the
 * dedicated SEO fields.
 */
export function buildMetadata(params: {
  seo?: SeoFields
  fallbackTitle: string
  fallbackDescription?: string
}): Metadata {
  const title = params.seo?.title || `${params.fallbackTitle} | GTS Hub`
  const description = params.seo?.description || params.fallbackDescription || undefined
  const ogImage = params.seo?.ogImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}
