import type { MainProductSummary } from "./api"
import { sportToSlug } from "./mock-products"

/**
 * The product, from one category's list, whose sport matches a /customize
 * URL sport segment. Both sides are compared as URL slugs, so "polo-t-shirt"
 * finds the stored sport "POLO T-SHIRT", and "football" / "FOOTBALL" both
 * find "Football".
 */
export function findBySportSlug<T extends { sport: string }>(products: T[], sport: string): T | undefined {
  const wanted = sportToSlug(sport)
  return products.find((product) => sportToSlug(product.sport) === wanted)
}

export interface ProductCard extends MainProductSummary {
  /** The product category this card opens, e.g. "Hoodie" for "Hoodie Custom Designed". */
  category: string
  href: string
}

// Wording admins add to product-line names that isn't part of what the line
// is - "Hoodie Custom Designed" is the "Hoodie" category.
const GENERIC_WORDS = /\b(?:custom|designed|designs?)\b/g

function nameKey(name: string): string {
  return name.toLowerCase().replace(GENERIC_WORDS, " ").replace(/[^a-z0-9]+/g, "")
}

/**
 * Pairs each main product (a /products card) with the product category its
 * card opens. The two are linked only by name, typed separately on each side
 * in the admin, so an exact match wins; failing that, the one category whose
 * name matches once case, punctuation, and generic "custom/design(ed)"
 * wording are ignored. A main product with no matching category - i.e. no
 * active products to pick from - or with several candidates gets no card,
 * so the page never advertises an empty listing.
 *
 * @param categories categories that have active products (GET /products/categories)
 */
export function resolveMainProductCards(mainProducts: MainProductSummary[], categories: string[]): ProductCard[] {
  return mainProducts.flatMap((mainProduct) => {
    const key = nameKey(mainProduct.name)
    const looseMatches = key ? categories.filter((category) => nameKey(category) === key) : []
    const category =
      categories.find((c) => c === mainProduct.name) ?? (looseMatches.length === 1 ? looseMatches[0] : undefined)
    return category ? [{ ...mainProduct, category, href: `/customize/${encodeURIComponent(category)}` }] : []
  })
}
