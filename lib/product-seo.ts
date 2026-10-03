// Search-facing copy for the product pages (/customize/<category> and
// /customize/<category>/<sport>): titles, headings, intros, and descriptions
// built from the catalog's own data. Product and category names are typed by
// the admin ("Football Custom Design jersey", "Jerseys Custom Designed"), so
// the copy is derived from the sport and product type instead.
//
// Only states what the order flow and the business actually offer: designs
// from the catalog or the customer's own, names/numbers/sizes, sleeve and
// collar options, shorts and tracks (the addons), live pricing from the
// product's price tiers, and delivery across Nepal (confirmed by the owner).

import { formatMoney, CURRENCY } from "./money"
import { brandTitle, toMetaDescription } from "./seo"
import { sportKey, sportLabel } from "./sports"
import { tidyIfLowercase } from "./text"

type ProductKind = "jersey" | "t-shirt" | "hoodie" | "other"

function productKind(category: string, sport: string): ProductKind {
  if (/jersey/i.test(category)) return "jersey"
  const text = `${category} ${sport}`.toLowerCase()
  if (/t-?shirt/.test(text)) return "t-shirt"
  if (/hoodie/.test(text)) return "hoodie"
  return "other"
}

const LOCATION = "Kathmandu, Nepal"

// One or two sentences per sport on what GTS makes for it. Shorts are an
// addon in the customizer; full/half sleeves and collars are its options.
const JERSEY_INTROS: Record<string, string> = {
  football:
    "Football kits for clubs, schools, colleges and tournaments: jerseys in your team's colours with your crest and sponsor logos, plus matching shorts.",
  cricket: "Cricket jerseys in full or half sleeves, with your team name, logo and sponsor artwork.",
  basketball: "Basketball jerseys and matching shorts for school, college and club teams.",
  volleyball: "Volleyball jerseys for school, college and club teams, in your team's colours with your logo.",
  esports:
    "Esports jerseys for gaming teams and tournaments, with your team logo, sponsor artwork and each player's in-game name.",
  cycling: "Cycling jerseys in your club's colours, with your logo and sponsor artwork.",
}

export interface ProductPageCopy {
  /** The page's h1 and breadcrumb name: "Custom Football Jerseys" */
  heading: string
  /** Full <title>: "Custom Football Jersey Printing in Nepal | GoalThali Sports" */
  title: string
  /** Line above the h1: "Jersey printing · Kathmandu, Nepal" */
  eyebrow: string
  /** Lower-case singular for alt text and copy: "football jersey" */
  noun: string
  /** Lower-case plural: "football jerseys" */
  nounPlural: string
  /** What GTS makes for this sport or style. */
  intro: string
  isJersey: boolean
}

export function productPageCopy(product: { name: string; category: string; sport: string }): ProductPageCopy {
  const kind = productKind(product.category, product.sport)

  if (kind === "jersey") {
    const label = sportLabel(product.sport)
    const noun = `${label.toLowerCase()} jersey`
    return {
      heading: `Custom ${label} Jerseys`,
      title: brandTitle(`Custom ${label} Jersey Printing in Nepal`),
      eyebrow: `Jersey printing · ${LOCATION}`,
      noun,
      nounPlural: `${noun}s`,
      intro:
        JERSEY_INTROS[sportKey(product.sport)] ??
        `Custom ${noun}s for your team, in your colours with your logo and sponsor artwork.`,
      isJersey: true,
    }
  }

  if (kind === "t-shirt") {
    return {
      heading: "Custom T-Shirts",
      title: brandTitle("Custom T-Shirt Printing in Nepal"),
      eyebrow: `T-shirt printing · ${LOCATION}`,
      noun: "T-shirt",
      nounPlural: "T-shirts",
      intro: "Custom T-shirts for teams, schools, events and companies, printed with your logo and artwork.",
      isJersey: false,
    }
  }

  if (kind === "hoodie") {
    return {
      heading: "Custom Hoodies",
      title: brandTitle("Custom Hoodie Printing in Nepal"),
      eyebrow: `Hoodie printing · ${LOCATION}`,
      noun: "hoodie",
      nounPlural: "hoodies",
      intro: "Custom hoodies for teams, schools, clubs and companies, printed with your logo and artwork.",
      isJersey: false,
    }
  }

  // "Track-suit Custom Designed" -> "Track-suit" -> "Custom Track-suit"
  const label = tidyIfLowercase(product.name.replace(/\bcustom(\s+design(s|ed)?)?\b/gi, " ")) || product.name.trim()
  const heading = `Custom ${label}`
  return {
    heading,
    title: brandTitle(`${heading} in Nepal`),
    eyebrow: `Custom sportswear · ${LOCATION}`,
    noun: label.toLowerCase(),
    nounPlural: label.toLowerCase(),
    intro: `${heading}, made to order for your team and printed with your logo and artwork.`,
    isJersey: false,
  }
}

/** The second intro sentence: what to do on this page. */
export function designsSentence(copy: ProductPageCopy, designCount: number): string {
  const details = copy.isJersey ? "names, numbers and sizes" : "names and sizes"
  return designCount > 0
    ? `Choose one of our ${designCount} ${copy.noun} design${designCount === 1 ? "" : "s"} below or upload your own, then add ${details}.`
    : `Upload your own design below, then add ${details} - or message us on WhatsApp for help with the design.`
}

export function productMetaDescription(copy: ProductPageCopy, designCount: number, hasPrices: boolean): string {
  const designs = designCount > 0 ? `${designCount} designs or your own` : "upload your own design"
  const details = copy.isJersey ? ", names and numbers" : ""
  const pricing = hasPrices ? "live pricing" : "quotes on WhatsApp"
  return (
    toMetaDescription(
      `Custom ${copy.noun} printing in ${LOCATION}: ${designs}${details}, ${pricing} and delivery across Nepal.`
    ) ?? ""
  )
}

interface TierLike {
  minQty: number
  maxQty: number | null
  price: number
}

function quantityRange(tier: TierLike): string {
  if (tier.maxQty === null) return `${tier.minQty}+`
  return tier.minQty === tier.maxQty ? `${tier.minQty}` : `${tier.minQty}–${tier.maxQty}`
}

/** "From Rs 900 per piece" - the lowest tier price; null without tiers. */
export function lowestPrice(tiers: TierLike[]): string | null {
  if (tiers.length === 0) return null
  return `From ${formatMoney(CURRENCY, Math.min(...tiers.map((t) => t.price)))} per piece`
}

/**
 * "From Rs 900 per piece for 151–350 pieces, or Rs 2,000 each for 1–2." -
 * straight from the product's price tiers; null when it has none (those
 * products are quoted per order).
 */
export function priceSummary(tiers: TierLike[]): string | null {
  if (tiers.length === 0) return null
  const byQuantity = [...tiers].sort((a, b) => a.minQty - b.minQty)
  const cheapest = tiers.reduce((best, t) => (t.price < best.price ? t : best))
  const smallest = byQuantity[0]
  const pieces = (tier: TierLike) => (tier.maxQty === 1 && tier.minQty === 1 ? "piece" : "pieces")
  const lowest = `From ${formatMoney(CURRENCY, cheapest.price)} per piece for ${quantityRange(cheapest)} ${pieces(cheapest)}`
  if (smallest === cheapest) return `${lowest}.`
  return `${lowest}, or ${formatMoney(CURRENCY, smallest.price)} each for ${quantityRange(smallest)} ${pieces(smallest)}.`
}

export interface CategoryPageCopy {
  heading: string
  title: string
  eyebrow: string
  description: string
  /** Instruction under the h1. */
  prompt: string
}

/** Copy for a /customize/<category> picker, given the sports (or styles) it offers. */
export function categoryPageCopy(category: string, sports: string[]): CategoryPageCopy {
  const kind = productKind(category, "")
  const labels = sports.map((s) => sportLabel(s).toLowerCase())
  const list = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}` : labels[0] ?? ""

  if (kind === "jersey") {
    return {
      heading: "Custom Team Jerseys",
      title: brandTitle("Custom Team Jerseys in Nepal"),
      eyebrow: `Jersey printing · ${LOCATION}`,
      description:
        toMetaDescription(
          `Custom team jerseys for ${list || "every sport"}, printed in Kathmandu and delivered across Nepal.`
        ) ?? "",
      prompt: "Choose your sport to see its designs.",
    }
  }

  const copy = productPageCopy({ name: category, category, sport: "" })
  return {
    heading: copy.heading,
    title: brandTitle(`${copy.heading} in Nepal`),
    eyebrow: copy.eyebrow,
    description:
      toMetaDescription(
        `${copy.heading} printed in Kathmandu, Nepal: pick a style and design, or upload your own, with delivery across Nepal.`
      ) ?? "",
    prompt: "Choose a style to see its designs.",
  }
}
