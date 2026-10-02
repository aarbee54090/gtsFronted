// "Our Work" (the CMS's portfolio projects): display helpers and the
// "Create a Similar Design" link. Only real CMS data is shown - nothing here
// invents a detail a project doesn't have.

import type { BackendProductSummary } from "./api"
import type { AdminProduct } from "./admin-types"
import type { MediaItem, PortfolioProject } from "./gts-hub-types"
import { HUB_BASE_PATH } from "./gts-hub-card-helpers"
import { sportToSlug } from "./mock-products"
import { customizePath, usableImageUrl } from "./seo"
import { tidyIfLowercase } from "./text"

export const OUR_WORK_PATH = HUB_BASE_PATH.portfolio

export function projectPath(project: Pick<PortfolioProject, "slug">): string {
  return `${OUR_WORK_PATH}/${project.slug}`
}

export function projectTitle(project: Pick<PortfolioProject, "title">): string {
  return tidyIfLowercase(project.title)
}

/** "Basketball · Jersey Kit" */
export function projectMeta(project: Pick<PortfolioProject, "sport" | "productType">): string {
  return [project.sport, project.productType].filter(Boolean).join(" · ")
}

/**
 * Who it was made for. A private individual's name is not repeated on the
 * site's cards and summaries - an organization's is.
 */
export function projectClient(project: Pick<PortfolioProject, "organizationName" | "organizationType">): string | null {
  const type = project.organizationType?.trim()
  if (type && /^individual$/i.test(type)) return "Individual order"
  const name = project.organizationName?.trim()
  return [name, type].filter(Boolean).join(" · ") || null
}

/** Card/cover image: the explicit thumbnail, else the first finished photo, else a design image. */
export function projectCoverImage(project: PortfolioProject): string | undefined {
  const candidates = [
    project.thumbnailImageUrl,
    ...(project.finalImages ?? []).filter((m) => m.type === "image").map((m) => m.url),
    ...(project.designImages ?? []).filter((m) => m.type === "image").map((m) => m.url),
  ]
  return candidates.map((url) => usableImageUrl(url)).find(Boolean)
}

// Alt text admins sometimes leave behind that describes nothing.
const GENERIC_ALT = /^(image|img|photo|picture|pic|final image|untitled|\d+)$/i

/**
 * Alt text for a project photo: the admin's own alt when it actually
 * describes something, otherwise the project title plus what kind of photo
 * it is ("Team RAYZRS kit - finished kit, photo 3").
 */
export function projectImageAlt(media: MediaItem, title: string, kind: string, index: number): string {
  const own = media.alt?.trim()
  if (own && own.length > 3 && !GENERIC_ALT.test(own)) return `${title} - ${own}`
  return `${title} - ${kind}, photo ${index + 1}`
}

interface SimilarDesignLink {
  href: string
  label: string
}

const words = (text: string) => new Set(text.toLowerCase().match(/[a-z]+/g) ?? [])

/**
 * Where "Create a Similar Design" should go, most specific first:
 * 1. The exact catalog design the project was built from (usedDesign), if
 *    that product is still active and still has the design.
 * 2. The design gallery for the project's sport - when several product
 *    lines cover the sport, the one whose name shares a word with the
 *    project's product type ("Jersey Kit" -> "Jerseys Custom Designed").
 * 3. The full product list.
 */
export function similarDesignLink(
  project: Pick<PortfolioProject, "sport" | "productType" | "usedDesign">,
  products: BackendProductSummary[],
  usedProduct: AdminProduct | null
): SimilarDesignLink {
  const designId = project.usedDesign?.designId
  if (usedProduct && designId && usedProduct.designs.some((d) => d._id === designId)) {
    return {
      href: `${customizePath(usedProduct.category, usedProduct.sport)}/${encodeURIComponent(designId)}`,
      label: "Customize this design",
    }
  }

  if (project.sport) {
    const wanted = sportToSlug(project.sport)
    const sameSport = products.filter((p) => sportToSlug(p.sport) === wanted)
    const typeWords = words(project.productType ?? "")
    const stem = (w: string) => w.replace(/s$/, "")
    const best =
      sameSport.find((p) => [...words(p.category)].some((w) => [...typeWords].some((t) => stem(t) === stem(w)))) ??
      (sameSport.length === 1 ? sameSport[0] : undefined)
    if (best) return { href: customizePath(best.category, best.sport), label: "Create a similar design" }
  }

  return { href: "/products", label: "Create a similar design" }
}
