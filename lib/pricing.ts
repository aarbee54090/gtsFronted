import type { ProductDetail, PricingTier, ConfigField, ConfigFieldValue } from "./types"

export interface AddonSelection {
  addonId: string
  styleId: string
  quantity: number
}

/**
 * Finds the price for the given quantity from a product's admin-managed
 * pricing tiers (e.g. "1-2 pcs = Rs 500", "3-5 pcs = Rs 480", "6+ pcs = Rs 450" -
 * maxQty of null means "and above"). Returns 0 if no tier matches or none
 * are configured, so this stays additive with the rest of the formula
 * rather than breaking it.
 */
export function getTierPrice(tiers: PricingTier[], quantity: number): number {
  return findPricingTier(tiers, quantity)?.price ?? 0
}

/**
 * The tier that prices `quantity` (first match in stored order - the same
 * rule backend/services/pricingTiers.js uses to check orders), or null when
 * no tier covers it.
 */
export function findPricingTier(tiers: PricingTier[], quantity: number): PricingTier | null {
  return tiers.find((t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)) ?? null
}

type TierShape = Pick<PricingTier, "minQty" | "maxQty" | "price">

/**
 * Same rules as backend/services/pricingTiers.js validatePricingTiers: null
 * when the tiers are usable, otherwise a message for the admin. Overlaps are
 * errors (a quantity can only have one price); gaps are allowed.
 */
export function validatePricingTiers(tiers: TierShape[]): string | null {
  for (const t of tiers) {
    if (!Number.isInteger(t.minQty) || t.minQty < 1) return "Each tier's minimum quantity must be a whole number of 1 or more"
    if (t.maxQty !== null) {
      if (!Number.isInteger(t.maxQty) || t.maxQty < 1) return "Each tier's maximum quantity must be a whole number (or empty for 'and above')"
      if (t.maxQty < t.minQty) return `Tier ${t.minQty}-${t.maxQty}: the maximum is smaller than the minimum`
    }
    if (!Number.isFinite(t.price) || t.price < 0) return `Tier starting at ${t.minQty} pcs needs a price of 0 or more`
  }
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const cur = sorted[i]
    if (cur.minQty <= (prev.maxQty ?? Infinity)) {
      const label = (t: TierShape) => `${t.minQty}-${t.maxQty ?? "and above"}`
      return `Pricing tiers ${label(prev)} and ${label(cur)} overlap - each quantity can only have one price`
    }
  }
  return null
}

/** Quantity ranges no tier covers ("1-4", "2001+") - customers are asked for a custom quote there. */
export function unpricedQuantities(tiers: TierShape[]): string[] {
  if (tiers.length === 0) return []
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty)
  const gaps: string[] = []
  let next = 1
  for (const t of sorted) {
    if (t.minQty > next) gaps.push(t.minQty - 1 === next ? `${next}` : `${next}-${t.minQty - 1}`)
    if (t.maxQty === null) return gaps
    next = Math.max(next, t.maxQty + 1)
  }
  gaps.push(`${next}+`)
  return gaps
}

/** "5-10, 11-60, 803+" - the quantities a product has prices for. */
export function describePricedQuantities(tiers: PricingTier[]): string {
  return [...tiers]
    .sort((a, b) => a.minQty - b.minQty)
    .map((t) => (t.maxQty === null ? `${t.minQty}+` : t.minQty === t.maxQty ? `${t.minQty}` : `${t.minQty}-${t.maxQty}`))
    .join(", ")
}

/**
 * Why a quote can't be ordered online, or null when it can. A quantity
 * outside every pricing tier (or a total that comes to zero) used to quote
 * Rs 0 and go through as a Rs 0 order; now it's sent to a custom quote instead.
 * The backend refuses the same orders.
 */
export function quoteBlocker(tiers: PricingTier[], quantity: number, total: number): string | null {
  if (quantity <= 0) return null
  if (!Number.isInteger(quantity)) return "Quantity must be a whole number."
  if (tiers.length > 0 && !findPricingTier(tiers, quantity)) {
    return `There's no set price for ${quantity} ${quantity === 1 ? "piece" : "pieces"} of this product (priced quantities: ${describePricedQuantities(tiers)}). Contact us for a custom quote.`
  }
  if (!(total > 0)) return "This combination doesn't have a price yet. Contact us for a custom quote."
  return null
}

/**
 * Sums per-option surcharges across all quantity_per_variant fields (e.g.
 * Full Sleeve costs +Rs 120 each, Collar costs +Rs 125 each). This is a lump
 * sum added to the subtotal directly - NOT a per-unit modifier - since it's
 * already "price × that option's own quantity", not "price × total order
 * quantity" (which would double-count).
 */
export function computeVariantSurcharge(
  configFields: ConfigField[],
  fieldValues: Record<string, ConfigFieldValue>
): number {
  let total = 0
  for (const field of configFields) {
    if (field.type !== "quantity_per_variant" || !field.optionPrices) continue
    const values = fieldValues[field.key]
    if (!values || typeof values !== "object") continue
    for (const [option, optionQuantity] of Object.entries(values as Record<string, number>)) {
      const price = field.optionPrices[option]
      if (price) total += price * (Number(optionQuantity) || 0)
    }
  }
  return total
}

export interface QuoteInput {
  product: ProductDetail
  designPrice?: number // admin-set price for the specific chosen design, added to unit price
  tierPrice?: number // admin-set per-product price for the current quantity tier, added to unit price
  variantSurcharge?: number // lump sum from priced options like Full Sleeve/Collar (already qty-multiplied)
  quantity: number // derived from quantity_per_variant fields, or entered directly
  addons: AddonSelection[]
  deadlineDate: string | null // ISO date string, or null if no deadline given
  couponCode: string | null
}

export interface QuoteBreakdown {
  unitPrice: number
  lineTotal: number
  addonsTotal: number
  variantSurcharge: number
  subtotal: number
  quantityDiscount: number
  couponDiscount: number
  discount: number
  total: number
  currency: string
}

/**
 * Mirrors the backend pricing engine service (spec section 7), so this is a
 * drop-in replacement target once a real POST /quotations endpoint exists.
 * This is a client-side *preview only* — the backend remains the source of
 * truth for the actual saved Quotation.
 *
 * Fabric has been removed as a pricing factor. Unit price is now just
 * whatever admin-set price the chosen design itself has, plus the
 * per-product quantity-tier price for however many pieces are being
 * ordered (e.g. "1-2 pcs = Rs 500", "3-5 pcs = Rs 480" - admin-managed per
 * product). Each addon's price comes from the specific style chosen (e.g.
 * Shorts "Full Design Print" costs more than "Normal"), not a single flat
 * price per addon.
 */
export function computeQuote(
  input: QuoteInput,
  matchedCoupon: { code: string; amountOff: number } | null
): QuoteBreakdown {
  const {
    product,
    designPrice = 0,
    tierPrice = 0,
    variantSurcharge = 0,
    quantity,
    addons,
    couponCode,
  } = input

  const unitPrice = designPrice + tierPrice
  const lineTotal = unitPrice * quantity

  const addonsTotal = addons.reduce((sum, sel) => {
    if (sel.quantity <= 0) return sum
    const addon = product.addons.find((a) => a.id === sel.addonId)
    const style = addon?.styles.find((s) => s.id === sel.styleId)
    if (!style) return sum
    return sum + style.price * sel.quantity
  }, 0)

  const subtotal = lineTotal + addonsTotal + variantSurcharge

  const quantityDiscount =
    quantity >= product.quantityDiscount.minQuantity
      ? subtotal * (product.quantityDiscount.percentOff / 100)
      : 0

  const couponDiscount =
    matchedCoupon && couponCode?.trim().toUpperCase() === matchedCoupon.code
      ? matchedCoupon.amountOff
      : 0

  // "maxa, not both" — the larger of the two applies, never stacked.
  const discount = Math.max(quantityDiscount, couponDiscount)

  const total = Math.max(subtotal - discount, 0)

  return {
    unitPrice,
    lineTotal,
    addonsTotal,
    variantSurcharge,
    subtotal,
    quantityDiscount,
    couponDiscount,
    discount,
    total,
    currency: product.currency,
  }
}
