import { describe, it, expect } from "vitest"
import type { MainProductSummary } from "@/lib/api"
import { findBySportSlug, resolveMainProductCards } from "@/lib/catalog"
import { sportToSlug } from "@/lib/mock-products"
import { decodeRouteParam } from "@/lib/route-params"

// Same vectors as backend/test/productLookup.test.js - both sides must agree
// on how a sport becomes a URL slug.
const SLUG_VECTORS: [string, string][] = [
  ["POLO T-SHIRT", "polo-t-shirt"],
  ["Football", "football"],
  ["volleyball", "volleyball"],
  ["e-sports", "e-sports"],
  ["Table  Tennis", "table-tennis"],
  ["Hoodie", "hoodie"],
]

describe("sportToSlug", () => {
  it.each(SLUG_VECTORS)("%s -> %s", (sport, slug) => {
    expect(sportToSlug(sport)).toBe(slug)
  })
})

describe("findBySportSlug", () => {
  const products = [
    { _id: "p-polo", sport: "POLO T-SHIRT" },
    { _id: "p-football", sport: "Football" },
  ]

  it("finds a multi-word sport from its URL slug (the Polo T-shirt bug)", () => {
    expect(findBySportSlug(products, "polo-t-shirt")?._id).toBe("p-polo")
    expect(findBySportSlug(products, "POLO T-SHIRT")?._id).toBe("p-polo")
  })

  it("ignores letter case", () => {
    expect(findBySportSlug(products, "FOOTBALL")?._id).toBe("p-football")
  })

  it("finds nothing for unknown or pattern-like input", () => {
    expect(findBySportSlug(products, "kabaddi")).toBeUndefined()
    expect(findBySportSlug(products, ".*")).toBeUndefined()
  })
})

describe("resolveMainProductCards", () => {
  // Shaped like the live catalog: the admin named the hoodie line differently
  // on each side, and the track-suit line has no products at all.
  const MAIN_PRODUCTS: MainProductSummary[] = [
    { _id: "m-hoodie", name: "Hoodie Custom Designed", description: "hoodie" },
    { _id: "m-jerseys", name: "Jerseys Custom Designed" },
    { _id: "m-tshirt", name: "T-shirt Custom Designed" },
    { _id: "m-tracksuit", name: "Track-suit Custom Designed", description: "Custom tracksuit" },
  ]
  const CATEGORIES = ["Hoodie", "Jerseys Custom Designed", "T-shirt Custom Designed"]

  it("links every card to a category that has products, and hides the rest", () => {
    const cards = resolveMainProductCards(MAIN_PRODUCTS, CATEGORIES)
    expect(cards.map((c) => [c._id, c.category, c.href])).toEqual([
      ["m-hoodie", "Hoodie", "/customize/Hoodie"],
      ["m-jerseys", "Jerseys Custom Designed", "/customize/Jerseys%20Custom%20Designed"],
      ["m-tshirt", "T-shirt Custom Designed", "/customize/T-shirt%20Custom%20Designed"],
    ])
  })

  it("keeps the card's own name, image, and description", () => {
    const [hoodie] = resolveMainProductCards(MAIN_PRODUCTS, CATEGORIES)
    expect(hoodie.name).toBe("Hoodie Custom Designed")
    expect(hoodie.description).toBe("hoodie")
  })

  it("prefers an exact name match over a loose one", () => {
    const [card] = resolveMainProductCards([MAIN_PRODUCTS[0]], ["Hoodie", "Hoodie Custom Designed"])
    expect(card.category).toBe("Hoodie Custom Designed")
  })

  it("hides a card whose loose match is ambiguous instead of guessing", () => {
    expect(resolveMainProductCards([MAIN_PRODUCTS[0]], ["Hoodie", "Hoodie Custom Design"])).toEqual([])
  })

  it("never loosely matches on generic wording alone", () => {
    expect(resolveMainProductCards([{ _id: "x", name: "Custom Designs" }], ["Custom"])).toEqual([])
  })

  it("shows nothing when no categories are available", () => {
    expect(resolveMainProductCards(MAIN_PRODUCTS, [])).toEqual([])
  })
})

describe("decodeRouteParam", () => {
  it("decodes percent-encoded segments", () => {
    expect(decodeRouteParam("Jerseys%20Custom%20Designed")).toBe("Jerseys Custom Designed")
    expect(decodeRouteParam("polo-t-shirt")).toBe("polo-t-shirt")
    expect(decodeRouteParam("100%25")).toBe("100%")
  })

  it("returns null for malformed encoding instead of throwing", () => {
    expect(decodeRouteParam("%E0%A4%A")).toBeNull()
    expect(decodeRouteParam("%")).toBeNull()
  })
})
