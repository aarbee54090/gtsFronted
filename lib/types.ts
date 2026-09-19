export interface PlayerRow {
  id: string
  name: string
  number: string
  size: string
  sleeveType: string
  neckType: string
  shortsTrack: string
  note: string
}

export type ConfigFieldType = "select" | "number" | "text" | "quantity_per_variant"

export type ConfigFieldValue = string | number | Record<string, number>

export interface ConfigField {
  key: string
  label: string
  type: ConfigFieldType
  options?: string[]
  required?: boolean
  /** Per-option surcharge, e.g. { "Full Sleeve": 120, "Collar": 125 }. Multiplied by that option's quantity, added to the order total. */
  optionPrices?: Record<string, number>
}

export interface FabricOption {
  id: string
  name: string
  priceModifier: number
  description?: string
}

export interface QualityTier {
  id: string
  name: string
  basePrice: number
  description?: string
}

export interface Design {
  id: string
  name: string
  sport: string // which applicableSports entry this design belongs to
  imageUrl?: string // Cloudinary URL from the backend; absent until uploaded there
  price?: number // admin-set price for this specific design
}

export interface AddonStyle {
  id: string
  label: string
  price: number
  imageUrl?: string
  description?: string
}

export interface Addon {
  id: string
  name: string
  styles: AddonStyle[]
}

export interface QuantityDiscount {
  type: "quantity_tier"
  minQuantity: number
  percentOff: number
}

export interface CouponDiscount {
  type: "coupon"
  code: string
  amountOff: number
}

export interface PricingTier {
  id: string
  minQty: number
  maxQty: number | null
  price: number
}

export interface ProductDetail {
  id: string
  name: string
  category: string
  applicableSports: string[]
  configFields: ConfigField[]
  fabricOptions: FabricOption[]
  qualityTiers: QualityTier[]
  designs: Design[]
  addons: Addon[]
  pricingTiers: PricingTier[]
  quantityDiscount: QuantityDiscount
  currency: string
}
