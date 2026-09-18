import { describe, it, expect } from "vitest"
import { computeQuote, getTierPrice, computeVariantSurcharge } from "@/lib/pricing"
import type { ConfigField } from "@/lib/types"
import { MOCK_PRODUCTS, MOCK_COUPON } from "@/lib/mock-products"

const product = MOCK_PRODUCTS["jersey-kit"]

describe("computeQuote", () => {
  it("calculates unit price as designPrice + tierPrice - fabric is no longer a pricing factor", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 500,
        quantity: 10,
        addons: [],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.unitPrice).toBe(500)
    expect(result.lineTotal).toBe(5000)
    expect(result.total).toBe(5000)
  })

  it("sums addon totals using the price of the chosen style, not a flat addon price", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 450,
        quantity: 10,
        addons: [
          { addonId: "shorts", styleId: "shorts-number-print", quantity: 10 }, // 265 * 10 = 2650
        ],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.addonsTotal).toBe(2650)
    expect(result.subtotal).toBe(450 * 10 + 2650)
  })

  it("charges different prices for different styles of the same addon", () => {
    const normalResult = computeQuote(
      {
        product,
        quantity: 1,
        addons: [{ addonId: "shorts", styleId: "shorts-normal", quantity: 1 }], // ₹220
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    const fullDesignResult = computeQuote(
      {
        product,
        quantity: 1,
        addons: [{ addonId: "shorts", styleId: "shorts-full-design", quantity: 1 }], // ₹700
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(normalResult.addonsTotal).toBe(220)
    expect(fullDesignResult.addonsTotal).toBe(700)
  })

  it("ignores an addon selection with an unrecognized style id", () => {
    const result = computeQuote(
      {
        product,
        quantity: 1,
        addons: [{ addonId: "shorts", styleId: "not-a-real-style", quantity: 5 }],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.addonsTotal).toBe(0)
  })

  it("applies rush surcharge only when deadline is within threshold", () => {
    const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    const result = computeQuote(
      {
        product,
        designPrice: 450,
        quantity: 10,
        addons: [],
        deadlineDate: soon,
        couponCode: null,
      },
      null
    )
    expect(result.rushApplied).toBe(true)
    expect(result.rushSurcharge).toBeCloseTo(4500 * 0.15)
  })

  it("does not apply rush surcharge when deadline is far away", () => {
    const far = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const result = computeQuote(
      {
        product,
        designPrice: 450,
        quantity: 10,
        addons: [],
        deadlineDate: far,
        couponCode: null,
      },
      null
    )
    expect(result.rushApplied).toBe(false)
    expect(result.rushSurcharge).toBe(0)
  })

  it("applies quantity-tier discount once minimum quantity is met", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 450,
        quantity: 50, // minQuantity 50, percentOff 5
        addons: [],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.quantityDiscount).toBeCloseTo(450 * 50 * 0.05)
    expect(result.discount).toBeCloseTo(result.quantityDiscount)
  })

  it("uses the larger of quantity-tier discount and coupon discount, never both", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 450, // * 50 = 22500 subtotal
        quantity: 50, // 5% quantity discount = 1125
        addons: [],
        deadlineDate: null,
        couponCode: MOCK_COUPON.code, // flat 500 off
      },
      MOCK_COUPON
    )
    // 5% of 22500 = 1125, bigger than the flat 500 coupon
    expect(result.quantityDiscount).toBeCloseTo(1125)
    expect(result.couponDiscount).toBe(500)
    expect(result.discount).toBeCloseTo(1125)
    expect(result.total).toBeCloseTo(22500 - 1125)
  })

  it("ignores an invalid coupon code", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 450,
        quantity: 10,
        addons: [],
        deadlineDate: null,
        couponCode: "NOT-A-REAL-CODE",
      },
      MOCK_COUPON
    )
    expect(result.couponDiscount).toBe(0)
  })

  it("never returns a negative total", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 450,
        quantity: 1,
        addons: [],
        deadlineDate: null,
        couponCode: MOCK_COUPON.code,
      },
      MOCK_COUPON
    )
    expect(result.total).toBeGreaterThanOrEqual(0)
  })
})

describe("getTierPrice", () => {
  const tiers = [
    { id: "t1", minQty: 1, maxQty: 2, price: 500 },
    { id: "t2", minQty: 3, maxQty: 5, price: 480 },
    { id: "t3", minQty: 6, maxQty: null, price: 450 },
  ]

  it("returns the price of the matching tier", () => {
    expect(getTierPrice(tiers, 1)).toBe(500)
    expect(getTierPrice(tiers, 2)).toBe(500)
    expect(getTierPrice(tiers, 4)).toBe(480)
  })

  it("matches the uncapped top tier (maxQty null) for anything at or above its minQty", () => {
    expect(getTierPrice(tiers, 6)).toBe(450)
    expect(getTierPrice(tiers, 1000)).toBe(450)
  })

  it("returns 0 when no tier matches or none are configured", () => {
    expect(getTierPrice([], 10)).toBe(0)
    expect(getTierPrice(tiers, 0)).toBe(0)
  })
})

describe("computeQuote - tier pricing", () => {
  it("adds the per-product tier price into the unit price, alongside design price", () => {
    const result = computeQuote(
      {
        product,
        designPrice: 50,
        tierPrice: 25,
        quantity: 10,
        addons: [],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.unitPrice).toBe(50 + 25)
  })

  it("defaults tierPrice and designPrice to 0 when not provided", () => {
    const result = computeQuote(
      {
        product,
        quantity: 10,
        addons: [],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.unitPrice).toBe(0)
  })
})

describe("computeVariantSurcharge", () => {
  const configFields: ConfigField[] = [
    {
      key: "sleeveType",
      label: "Sleeve Type",
      type: "quantity_per_variant" as const,
      options: ["Full Sleeve", "Half Sleeve"],
      optionPrices: { "Full Sleeve": 120 },
    },
    {
      key: "collarType",
      label: "Collar Type",
      type: "quantity_per_variant" as const,
      options: ["Round Neck", "V-Neck", "Collar"],
      optionPrices: { Collar: 125 },
    },
  ]

  it("charges the surcharge only for priced options, multiplied by that option's own quantity", () => {
    const total = computeVariantSurcharge(configFields, {
      sleeveType: { "Full Sleeve": 3, "Half Sleeve": 5 },
      collarType: { "Round Neck": 2, "V-Neck": 0, Collar: 4 },
    })
    // Full Sleeve: 3 x 120 = 360. Half Sleeve: no price, contributes 0.
    // Collar: 4 x 125 = 500. Round Neck/V-Neck: no price, contribute 0.
    expect(total).toBe(360 + 500)
  })

  it("returns 0 when no priced option has any quantity", () => {
    const total = computeVariantSurcharge(configFields, {
      sleeveType: { "Full Sleeve": 0, "Half Sleeve": 10 },
    })
    expect(total).toBe(0)
  })

  it("returns 0 when fieldValues is empty", () => {
    expect(computeVariantSurcharge(configFields, {})).toBe(0)
  })

  it("ignores fields without optionPrices configured", () => {
    const fieldsWithoutPricing = [
      { key: "x", label: "X", type: "quantity_per_variant" as const, options: ["A"] },
    ]
    const total = computeVariantSurcharge(fieldsWithoutPricing, { x: { A: 10 } })
    expect(total).toBe(0)
  })
})

describe("computeQuote - variant surcharge", () => {
  it("adds variantSurcharge into subtotal directly, not multiplied by quantity again", () => {
    const result = computeQuote(
      {
        product,
        variantSurcharge: 240, // e.g. 2 x Full Sleeve @ ₹120
        quantity: 2,
        addons: [],
        deadlineDate: null,
        couponCode: null,
      },
      null
    )
    expect(result.variantSurcharge).toBe(240)
    expect(result.subtotal).toBe(240) // unitPrice is 0 here, so subtotal is just the surcharge
    expect(result.total).toBe(240)
  })
})
