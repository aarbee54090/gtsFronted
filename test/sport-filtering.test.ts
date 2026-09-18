import { describe, it, expect } from "vitest"
import {
  MOCK_PRODUCTS,
  sportToSlug,
  slugToSport,
  getProductForSport,
} from "@/lib/mock-products"

const jerseyKit = MOCK_PRODUCTS["jersey-kit"]

describe("sportToSlug", () => {
  it("lowercases sport names into slugs", () => {
    expect(sportToSlug("Football")).toBe("football")
    expect(sportToSlug("Basketball")).toBe("basketball")
  })
})

describe("slugToSport", () => {
  it("resolves a valid slug back to the matching applicableSports entry", () => {
    expect(slugToSport(jerseyKit, "football")).toBe("Football")
    expect(slugToSport(jerseyKit, "volleyball")).toBe("Volleyball")
  })

  it("returns null for a slug not in applicableSports", () => {
    expect(slugToSport(jerseyKit, "rugby")).toBeNull()
  })
})

describe("getProductForSport", () => {
  it("filters designs down to only the given sport", () => {
    const filtered = getProductForSport(jerseyKit, "Football")
    expect(filtered.designs.length).toBeGreaterThan(0)
    expect(filtered.designs.every((d) => d.sport === "Football")).toBe(true)
  })

  it("does not include designs from other sports", () => {
    const filtered = getProductForSport(jerseyKit, "Football")
    expect(filtered.designs.some((d) => d.sport === "Volleyball")).toBe(false)
    expect(filtered.designs.some((d) => d.sport === "Basketball")).toBe(false)
    expect(filtered.designs.some((d) => d.sport === "Cricket")).toBe(false)
  })

  it("leaves everything else about the product unchanged", () => {
    const filtered = getProductForSport(jerseyKit, "Cricket")
    expect(filtered.fabricOptions).toEqual(jerseyKit.fabricOptions)
    expect(filtered.qualityTiers).toEqual(jerseyKit.qualityTiers)
    expect(filtered.configFields).toEqual(jerseyKit.configFields)
  })
})
