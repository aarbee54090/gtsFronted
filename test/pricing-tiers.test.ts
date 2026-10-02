import { describe, it, expect } from "vitest"
import {
  describePricedQuantities,
  findPricingTier,
  getTierPrice,
  quoteBlocker,
  unpricedQuantities,
  validatePricingTiers,
} from "@/lib/pricing"
import type { PricingTier } from "@/lib/types"

// The live Polo T-shirt tiers as entered on 2026-10-01: 402 sits in two
// tiers, and 1-4 / 2001+ have no price.
const POLO: PricingTier[] = [
  { id: "a", minQty: 5, maxQty: 10, price: 1200 },
  { id: "b", minQty: 11, maxQty: 60, price: 1100 },
  { id: "c", minQty: 61, maxQty: 101, price: 1000 },
  { id: "d", minQty: 102, maxQty: 402, price: 900 },
  { id: "e", minQty: 402, maxQty: 802, price: 800 },
  { id: "f", minQty: 803, maxQty: 2000, price: 700 },
]

describe("findPricingTier / getTierPrice", () => {
  it("prices covered quantities, first match wins on an overlap (same as the backend)", () => {
    expect(getTierPrice(POLO, 5)).toBe(1200)
    expect(getTierPrice(POLO, 402)).toBe(900)
    expect(findPricingTier(POLO, 2000)?.price).toBe(700)
  })

  it("returns no tier for uncovered quantities", () => {
    expect(findPricingTier(POLO, 4)).toBeNull()
    expect(findPricingTier(POLO, 2001)).toBeNull()
    expect(getTierPrice(POLO, 2001)).toBe(0)
  })
})

describe("quoteBlocker", () => {
  it("allows a priced quantity with a real total", () => {
    expect(quoteBlocker(POLO, 20, 22000)).toBeNull()
  })

  it("sends quantities outside every tier to a custom quote, instead of a Rs 0 order", () => {
    expect(quoteBlocker(POLO, 3, 0)).toMatch(/no set price for 3 pieces.*custom quote/i)
    expect(quoteBlocker(POLO, 2500, 0)).toMatch(/priced quantities: 5-10, 11-60, 61-101, 102-402, 402-802, 803-2000/)
  })

  it("blocks a zero total even when no tiers are configured", () => {
    expect(quoteBlocker([], 10, 0)).toMatch(/custom quote/i)
    expect(quoteBlocker([], 10, 500)).toBeNull()
  })

  it("says nothing until a quantity is entered", () => {
    expect(quoteBlocker(POLO, 0, 0)).toBeNull()
  })
})

describe("admin tier helpers", () => {
  it("validatePricingTiers rejects the 402 overlap and accepts gaps", () => {
    expect(validatePricingTiers(POLO)).toMatch(/102-402 and 402-802 overlap/)
    expect(validatePricingTiers([{ minQty: 5, maxQty: 10, price: 1 }, { minQty: 20, maxQty: null, price: 1 }])).toBeNull()
    expect(validatePricingTiers([{ minQty: 10, maxQty: 5, price: 1 }])).toMatch(/smaller than the minimum/)
  })

  it("unpricedQuantities lists the gaps customers can't order online", () => {
    expect(unpricedQuantities(POLO)).toEqual(["1-4", "2001+"])
    expect(unpricedQuantities([{ minQty: 1, maxQty: 10, price: 1 }, { minQty: 12, maxQty: null, price: 1 }])).toEqual(["11"])
    expect(unpricedQuantities([])).toEqual([])
  })

  it("describePricedQuantities", () => {
    expect(describePricedQuantities([{ id: "x", minQty: 20, maxQty: null, price: 1 }, { id: "y", minQty: 5, maxQty: 5, price: 1 }])).toBe("5, 20+")
  })
})
