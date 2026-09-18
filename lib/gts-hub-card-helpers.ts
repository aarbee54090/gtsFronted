import type { ContentType, JournalArticle, Material, MediaItem, NewArrival, PortfolioProject } from "./gts-hub-types"

export interface CardDisplayData {
  id: string
  title: string
  slug: string
  excerpt?: string
  image?: MediaItem
  /** Distinct mobile-crop URL, only set when the admin provided one for the thumbnail. */
  imageMobileUrl?: string
  meta?: string // small secondary line, e.g. sport/productType or category
}

function thumbnailImage(url: string | undefined): MediaItem | undefined {
  return url ? { url, type: "image", provider: "cloudinary" } : undefined
}

export function toCardData(
  contentType: ContentType,
  item: PortfolioProject | JournalArticle | NewArrival | Material
): CardDisplayData {
  switch (contentType) {
    case "portfolio": {
      const p = item as PortfolioProject
      return {
        id: p._id,
        title: p.title,
        slug: p.slug,
        excerpt: p.description,
        image: thumbnailImage(p.thumbnailImageUrl) ?? p.finalImages?.[0],
        imageMobileUrl: p.thumbnailImageUrl ? p.thumbnailImageUrlMobile : undefined,
        meta: [p.sport, p.productType].filter(Boolean).join(" · "),
      }
    }
    case "journal": {
      const j = item as JournalArticle
      return {
        id: j._id,
        title: j.title,
        slug: j.slug,
        excerpt: j.excerpt,
        image: j.coverImage,
        meta: j.category,
      }
    }
    case "new-arrival": {
      const n = item as NewArrival
      return {
        id: n._id,
        title: n.title,
        slug: n.slug,
        excerpt: n.description,
        image: thumbnailImage(n.thumbnailImageUrl) ?? n.images?.[0],
        imageMobileUrl: n.thumbnailImageUrl ? n.thumbnailImageUrlMobile : undefined,
        meta: [n.sport, n.productType].filter(Boolean).join(" · "),
      }
    }
    case "material": {
      const m = item as Material
      return {
        id: m._id,
        title: m.name,
        slug: m.slug,
        excerpt: m.description,
        image: thumbnailImage(m.thumbnailImageUrl) ?? m.images?.[0],
        imageMobileUrl: m.thumbnailImageUrl ? m.thumbnailImageUrlMobile : undefined,
        meta: m.category,
      }
    }
  }
}

export const HUB_BASE_PATH: Record<ContentType, string> = {
  portfolio: "/gts-hub/portfolio",
  journal: "/gts-hub/journal",
  "new-arrival": "/gts-hub/new-arrivals",
  material: "/gts-hub/materials",
}

export const HUB_TYPE_LABEL: Record<ContentType, string> = {
  portfolio: "Portfolio",
  journal: "Journal",
  "new-arrival": "New Arrival",
  material: "Material",
}
