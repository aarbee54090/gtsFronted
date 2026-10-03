import type { Metadata } from "next"
import { cleanImageUrl } from "./images"
import { sportToSlug } from "./mock-products"
import { SITE_NAME, SITE_URL } from "./site"

// The homepage targets "jersey printing in Kathmandu"; product pages target
// their own sport or style (lib/product-seo.ts), so no two pages compete.
export const HOME_TITLE = `Jersey Printing in Kathmandu, Nepal | ${SITE_NAME}`

// Homepage meta description and the Organization's description.
export const SITE_DESCRIPTION =
  "Custom jersey printing in Kathmandu, Nepal. Football, cricket, basketball, volleyball and esports jerseys, T-shirts and hoodies, delivered across Nepal."

// Shared 1200x630 social card, used whenever a page has no more specific
// image of its own. Built from the homepage hero assets and brand badge.
export const DEFAULT_OG_IMAGE = {
  url: "/images/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "GoalThali Sports - custom sportswear and jersey printing in Nepal",
}

export interface OgImage {
  url: string
  width?: number
  height?: number
  alt?: string
}

/** "Journal" -> "Journal | GoalThali Sports" */
export function brandTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`
}

/**
 * Absolute URL on the production origin, in the same form Next renders
 * canonicals and the sitemap uses: no trailing slash, and the root is the
 * bare origin.
 */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`
}

/**
 * Canonical /customize URL for a category (and sport), built from the names
 * stored in the backend - the same form the product/sport pickers link to and
 * the sitemap lists, whatever casing a visitor typed into the address bar.
 */
export function customizePath(category: string, sport?: string): string {
  const base = `/customize/${encodeURIComponent(category)}`
  return sport ? `${base}/${sportToSlug(sport)}` : base
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
}

/** Plain text from admin-authored (Tiptap) HTML, for descriptions. */
export function stripHtml(html: string | undefined): string | undefined {
  if (!html) return undefined
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(amp|nbsp|quot|#39|lt|gt);/g, (entity) => HTML_ENTITIES[entity])
}

/**
 * Collapses whitespace and, for text that wasn't written as a meta
 * description (excerpts, body copy), trims it to a snippet-sized length at
 * a word boundary.
 */
export function toMetaDescription(text: string | undefined, maxLength = 160): string | undefined {
  const clean = text?.replace(/\s+/g, " ").trim()
  if (!clean) return undefined
  if (clean.length <= maxLength) return clean
  const cut = clean.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(" ")
  const trimmed = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${trimmed.replace(/[\s,;:.\-–—]+$/, "")}…`
}

/**
 * CMS image fields are free text, and some hold a slug or a keyword list
 * instead of a URL. Only absolute http(s) URLs that clearly point at an image
 * are usable as og:image / JSON-LD images - a Cloudinary image delivery URL,
 * or any URL whose path ends in an image extension.
 */
export function usableImageUrl(value: string | undefined): string | undefined {
  // A link pasted twice into the field is reduced to the one URL first.
  const cleaned = cleanImageUrl(value)
  if (!cleaned) return undefined
  let url: URL
  try {
    url = new URL(cleaned)
  } catch {
    return undefined
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined
  if (url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/")) return url.toString()
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(url.pathname) ? url.toString() : undefined
}

interface PageMetadataInput {
  /** Full <title>, brand included (see brandTitle). */
  title: string
  description?: string
  /** Canonical path. Leave it out on pages that shouldn't be indexed. */
  path?: string
  /** Social images, most specific first. Falls back to DEFAULT_OG_IMAGE. */
  images?: OgImage[]
  noindex?: boolean
  article?: { publishedTime?: string; modifiedTime?: string; section?: string }
}

/**
 * Complete per-page metadata: title, description, canonical, Open Graph,
 * and X/Twitter tags. Next replaces nested objects like `openGraph` instead
 * of merging them with the root layout's, so every page that sets any of
 * them has to set all of them - this keeps that consistent.
 */
export function pageMetadata({ title, description, path, images, noindex, article }: PageMetadataInput): Metadata {
  const ogImages = images && images.length > 0 ? images : [DEFAULT_OG_IMAGE]
  const openGraph = {
    title,
    ...(description ? { description } : {}),
    ...(path ? { url: path } : {}),
    siteName: SITE_NAME,
    locale: "en_US",
    images: ogImages,
  }

  return {
    title,
    ...(description ? { description } : {}),
    ...(path && !noindex ? { alternates: { canonical: path } } : {}),
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: article ? { ...openGraph, type: "article", ...article } : { ...openGraph, type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      images: ogImages,
    },
  }
}
