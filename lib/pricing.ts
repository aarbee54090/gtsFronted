import type { ProductDetail, PricingTier, ConfigField, ConfigFieldValue } from "./types"

export interface AddonSelection {
  addonId: string
  styleId: string
  quantity: number
}

/**
 * Finds the price for the given quantity from a product's admin-managed
 * pricing tiers (e.g. "1-2 pcs = ₹500", "3-5 pcs = ₹480", "6+ pcs = ₹450" -
 * maxQty of null means "and above"). Returns 0 if no tier matches or none
 * are configured, so this stays additive with the rest of the formula
 * rather than breaking it.
 */
export function getTierPrice(tiers: PricingTier[], quantity: number): number {
  const match = tiers.find(
    (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
  )
  return match?.price ?? 0
}

/**
 * Sums per-option surcharges across all quantity_per_variant fields (e.g.
 * Full Sleeve costs +₹120 each, Collar costs +₹125 each). This is a lump
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
 * ordered (e.g. "1-2 pcs = ₹500", "3-5 pcs = ₹480" - admin-managed per
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
