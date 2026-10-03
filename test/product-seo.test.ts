import { describe, it, expect } from "vitest"
import { CURRENCY, displayCurrency, formatMoney } from "@/lib/money"
import {
  categoryPageCopy,
  designsSentence,
  priceSummary,
  productMetaDescription,
  productPageCopy,
} from "@/lib/product-seo"
import { sportKey, sportLabel } from "@/lib/sports"
import { HOME_TITLE, SITE_DESCRIPTION } from "@/lib/seo"
import { organizationNode } from "@/lib/structured-data"

const NBSP = " "

// The live catalog's names, as the admin typed them.
const FOOTBALL = { name: "Football Custom Design jersey", category: "Jerseys Custom Designed", sport: "Football" }
const ESPORTS = { name: "E-sports Custom Jersey Design", category: "Jerseys Custom Designed", sport: "e-sports" }
const TSHIRT = { name: "T-shirt", category: "T-shirt Custom Designed", sport: "t-shirt" }
const HOODIE = { name: "Hoodie Custom Design", category: "Hoodie  custom designed", sport: "Hoodie" }
const JERSEY_TIERS = [
  { minQty: 1, maxQty: 2, price: 2000 },
  { minQty: 3, maxQty: 5, price: 1500 },
  { minQty: 151, maxQty: 350, price: 900 },
]

describe("money", () => {
  it("shows prices in Nepali rupees, on one line", () => {
    expect(CURRENCY).toBe("Rs")
    expect(formatMoney("Rs", 1200)).toBe(`Rs${NBSP}1,200`)
  })

  it("shows the old ₹ symbol on earlier orders as Rs - those amounts were always rupees", () => {
    expect(displayCurrency("₹")).toBe("Rs")
    expect(displayCurrency(undefined)).toBe("Rs")
    expect(formatMoney("₹", 400)).toBe(`Rs${NBSP}400`)
  })
})

describe("product page copy", () => {
  it("titles jersey pages by sport, not by the admin's product name", () => {
    const copy = productPageCopy(FOOTBALL)
    expect(copy.title).toBe("Custom Football Jersey Printing in Nepal | GoalThali Sports")
    expect(copy.heading).toBe("Custom Football Jerseys")
    expect(copy.eyebrow).toBe("Jersey printing · Kathmandu, Nepal")
    expect(copy.noun).toBe("football jersey")
  })

  it("writes sports the way people search for them", () => {
    expect(sportLabel("e-sports")).toBe("Esports")
    expect(sportLabel("volleyball")).toBe("Volleyball")
    expect(sportKey("E-Sports")).toBe(sportKey("esports"))
    expect(productPageCopy(ESPORTS).heading).toBe("Custom Esports Jerseys")
  })

  it("covers T-shirts and hoodies as their own products", () => {
    expect(productPageCopy(TSHIRT).title).toBe("Custom T-Shirt Printing in Nepal | GoalThali Sports")
    expect(productPageCopy(HOODIE).heading).toBe("Custom Hoodies")
    expect(productPageCopy(TSHIRT).isJersey).toBe(false)
  })

  it("names an unknown product without repeating the admin's 'Custom Designed'", () => {
    const copy = productPageCopy({ name: "Track-suit Custom Designed", category: "Track-suit Custom Designed", sport: "Track-suit" })
    expect(copy.heading).toBe("Custom Track-suit")
  })

  it("keeps every title short enough to show in full in search results", () => {
    for (const product of [FOOTBALL, ESPORTS, TSHIRT, HOODIE]) {
      expect(productPageCopy(product).title.length).toBeLessThanOrEqual(62)
    }
    expect(HOME_TITLE.length).toBeLessThanOrEqual(62)
  })

  it("describes designs and pricing honestly - no live price promised without price tiers", () => {
    const football = productPageCopy(FOOTBALL)
    expect(productMetaDescription(football, 23, true)).toBe(
      "Custom football jersey printing in Kathmandu, Nepal: 23 designs or your own, names and numbers, live pricing and delivery across Nepal."
    )
    const hoodie = productMetaDescription(productPageCopy(HOODIE), 0, false)
    expect(hoodie).toContain("upload your own design")
    expect(hoodie).toContain("quotes on WhatsApp")
    expect(hoodie).not.toContain("live pricing")
    for (const text of [SITE_DESCRIPTION, productMetaDescription(football, 23, true), hoodie]) {
      expect(text.length).toBeLessThanOrEqual(160)
    }
  })

  it("tells customers what to do with or without catalog designs", () => {
    const football = productPageCopy(FOOTBALL)
    expect(designsSentence(football, 23)).toBe(
      "Choose one of our 23 football jersey designs below or upload your own, then add names, numbers and sizes."
    )
    expect(designsSentence(productPageCopy(HOODIE), 0)).toMatch(/^Upload your own design below, then add names and sizes/)
  })
})

describe("price summary", () => {
  it("quotes the lowest per-piece price and the small-order price from the real tiers", () => {
    expect(priceSummary(JERSEY_TIERS)).toBe(
      `From Rs${NBSP}900 per piece for 151–350 pieces, or Rs${NBSP}2,000 each for 1–2 pieces.`
    )
  })

  it("handles open-ended and single-piece tiers", () => {
    expect(priceSummary([{ minQty: 1, maxQty: 1, price: 2000 }, { minQty: 2, maxQty: null, price: 1800 }])).toBe(
      `From Rs${NBSP}1,800 per piece for 2+ pieces, or Rs${NBSP}2,000 each for 1 piece.`
    )
    expect(priceSummary([{ minQty: 5, maxQty: 10, price: 1200 }])).toBe(`From Rs${NBSP}1,200 per piece for 5–10 pieces.`)
  })

  it("says nothing when a product has no price tiers (it's quoted per order)", () => {
    expect(priceSummary([])).toBeNull()
  })
})

describe("category page copy", () => {
  it("names the jersey picker for what it is and lists the real sports", () => {
    const copy = categoryPageCopy("Jerseys Custom Designed", ["Football", "Cricket", "e-sports"])
    expect(copy.heading).toBe("Custom Team Jerseys")
    expect(copy.title).toBe("Custom Team Jerseys in Nepal | GoalThali Sports")
    expect(copy.description).toContain("football, cricket and esports")
    expect(copy.description.length).toBeLessThanOrEqual(160)
  })

  it("uses a style prompt for non-jersey categories", () => {
    const copy = categoryPageCopy("T-shirt Custom Designed", ["t-shirt"])
    expect(copy.heading).toBe("Custom T-Shirts")
    expect(copy.prompt).toBe("Choose a style to see its designs.")
  })
})

describe("structured data", () => {
  it("says the business serves all of Nepal", () => {
    expect(organizationNode([], null).areaServed).toEqual({ "@type": "Country", name: "Nepal" })
  })
})
