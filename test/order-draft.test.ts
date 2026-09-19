import { describe, it, expect, beforeEach } from "vitest"
import { saveOrderDraft, loadOrderDraft, clearOrderDraft, generateMockOrderId, type OrderDraft } from "@/lib/order-draft"

const sampleDraft: OrderDraft = {
  productName: "Football Jersey Kit",
  designName: "Classic Stripe",
  categoryId: "jersey-kit",
  sportSlug: "football",
  sleeveBreakdown: [{ label: "Full Sleeve", quantity: 5 }],
  collarBreakdown: [],
  addonLines: [],
  players: [],
  additionalFiles: [],
  quantity: 5,
  deadlineDate: "",
  couponCode: "",
  quote: {
    unitPrice: 450,
    lineTotal: 2250,
    addonsTotal: 0,
    variantSurcharge: 0,
    subtotal: 2250,
    quantityDiscount: 0,
    couponDiscount: 0,
    discount: 0,
    total: 2250,
    currency: "₹",
  },
}

beforeEach(() => {
  clearOrderDraft()
})

describe("order-draft", () => {
  it("returns null when no draft has been saved", () => {
    expect(loadOrderDraft()).toBeNull()
  })

  it("saves and loads a draft correctly", () => {
    saveOrderDraft(sampleDraft)
    const loaded = loadOrderDraft()
    expect(loaded).toEqual(sampleDraft)
  })

  it("clears the draft", () => {
    saveOrderDraft(sampleDraft)
    clearOrderDraft()
    expect(loadOrderDraft()).toBeNull()
  })
})

describe("generateMockOrderId", () => {
  it("generates an ID prefixed with GTS-", () => {
    expect(generateMockOrderId()).toMatch(/^GTS-[A-Z2-9]{8}$/)
  })

  it("generates a different ID each time (not sequential/predictable)", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateMockOrderId()))
    expect(ids.size).toBeGreaterThan(1)
  })
})
