import type { ProductDetail } from "./types"

// Mock data standing in for `GET /products/:id`. Shape mirrors the real
// Product schema (configFields, fabricOptions, qualityTiers, designs, addons)
// so swapping in a real fetch later is a drop-in replacement, not a rewrite.
export const MOCK_PRODUCTS: Record<string, ProductDetail> = {
  "jersey-kit": {
    id: "jersey-kit",
    name: "Football Jersey Kit",
    category: "Jersey Kit",
    applicableSports: ["Football", "Volleyball", "Basketball", "Cricket"],
    configFields: [
      {
        key: "sleeveType",
        label: "Sleeve Type",
        type: "quantity_per_variant",
        options: ["Full Sleeve"],
        required: false,
        optionPrices: { "Full Sleeve": 120 },
      },
      {
        key: "collarType",
        label: "Collar Type",
        type: "quantity_per_variant",
        options: ["Polo Neck"],
        required: false,
        optionPrices: { "Polo Neck": 125 },
      },
    ],
    fabricOptions: [
      { id: "polyester-dryfit", name: "Polyester Dry-Fit", priceModifier: 450 },
      { id: "micro-mesh", name: "Micro Mesh", priceModifier: 500 },
      { id: "premium-interlock", name: "Premium Interlock", priceModifier: 570 },
    ],
    qualityTiers: [
      { id: "standard", name: "Standard", basePrice: 450 },
      { id: "premium", name: "Premium", basePrice: 650 },
      { id: "elite", name: "Elite", basePrice: 850 },
    ],
    designs: [
      // Football
      { id: "football-classic-stripe", name: "Classic Stripe", sport: "Football" },
      { id: "football-diagonal-fade", name: "Diagonal Fade", sport: "Football" },
      { id: "football-solid-panel", name: "Solid Panel", sport: "Football" },
      { id: "football-arc-swoosh", name: "Arc Swoosh", sport: "Football" },
      { id: "football-side-block", name: "Side Block", sport: "Football" },
      { id: "football-half-tone", name: "Half Tone", sport: "Football" },
      { id: "football-chevron", name: "Chevron", sport: "Football" },
      { id: "football-gradient-wave", name: "Gradient Wave", sport: "Football" },
      { id: "football-classic-hoop", name: "Classic Hoop", sport: "Football" },
      { id: "football-angular-cut", name: "Angular Cut", sport: "Football" },
      { id: "football-minimal-crest", name: "Minimal Crest", sport: "Football" },
      { id: "football-retro-band", name: "Retro Band", sport: "Football" },
      { id: "football-pinstripe", name: "Pinstripe", sport: "Football" },
      { id: "football-shadow-fade", name: "Shadow Fade", sport: "Football" },
      { id: "football-split-panel", name: "Split Panel", sport: "Football" },
      // Volleyball
      { id: "volleyball-vertical-panel", name: "Vertical Panel", sport: "Volleyball" },
      { id: "volleyball-bold-block", name: "Bold Block", sport: "Volleyball" },
      { id: "volleyball-neon-grid", name: "Neon Grid", sport: "Volleyball" },
      { id: "volleyball-arc-swoosh", name: "Arc Swoosh", sport: "Volleyball" },
      { id: "volleyball-side-block", name: "Side Block", sport: "Volleyball" },
      { id: "volleyball-half-tone", name: "Half Tone", sport: "Volleyball" },
      { id: "volleyball-chevron", name: "Chevron", sport: "Volleyball" },
      { id: "volleyball-gradient-wave", name: "Gradient Wave", sport: "Volleyball" },
      { id: "volleyball-classic-hoop", name: "Classic Hoop", sport: "Volleyball" },
      { id: "volleyball-angular-cut", name: "Angular Cut", sport: "Volleyball" },
      { id: "volleyball-minimal-crest", name: "Minimal Crest", sport: "Volleyball" },
      { id: "volleyball-retro-band", name: "Retro Band", sport: "Volleyball" },
      { id: "volleyball-pinstripe", name: "Pinstripe", sport: "Volleyball" },
      { id: "volleyball-shadow-fade", name: "Shadow Fade", sport: "Volleyball" },
      { id: "volleyball-split-panel", name: "Split Panel", sport: "Volleyball" },
      // Basketball
      { id: "basketball-side-fade", name: "Side Fade", sport: "Basketball" },
      { id: "basketball-sunburst", name: "Sunburst", sport: "Basketball" },
      { id: "basketball-court-camo", name: "Court Camo", sport: "Basketball" },
      { id: "basketball-arc-swoosh", name: "Arc Swoosh", sport: "Basketball" },
      { id: "basketball-side-block", name: "Side Block", sport: "Basketball" },
      { id: "basketball-half-tone", name: "Half Tone", sport: "Basketball" },
      { id: "basketball-chevron", name: "Chevron", sport: "Basketball" },
      { id: "basketball-gradient-wave", name: "Gradient Wave", sport: "Basketball" },
      { id: "basketball-classic-hoop", name: "Classic Hoop", sport: "Basketball" },
      { id: "basketball-angular-cut", name: "Angular Cut", sport: "Basketball" },
      { id: "basketball-minimal-crest", name: "Minimal Crest", sport: "Basketball" },
      { id: "basketball-retro-band", name: "Retro Band", sport: "Basketball" },
      { id: "basketball-pinstripe", name: "Pinstripe", sport: "Basketball" },
      { id: "basketball-shadow-fade", name: "Shadow Fade", sport: "Basketball" },
      { id: "basketball-split-panel", name: "Split Panel", sport: "Basketball" },
      // Cricket
      { id: "cricket-clean-whites", name: "Clean Whites", sport: "Cricket" },
      { id: "cricket-ocean-blue", name: "Ocean Blue", sport: "Cricket" },
      { id: "cricket-vintage-cream", name: "Vintage Cream", sport: "Cricket" },
      { id: "cricket-arc-swoosh", name: "Arc Swoosh", sport: "Cricket" },
      { id: "cricket-side-block", name: "Side Block", sport: "Cricket" },
      { id: "cricket-half-tone", name: "Half Tone", sport: "Cricket" },
      { id: "cricket-chevron", name: "Chevron", sport: "Cricket" },
      { id: "cricket-gradient-wave", name: "Gradient Wave", sport: "Cricket" },
      { id: "cricket-classic-hoop", name: "Classic Hoop", sport: "Cricket" },
      { id: "cricket-angular-cut", name: "Angular Cut", sport: "Cricket" },
      { id: "cricket-minimal-crest", name: "Minimal Crest", sport: "Cricket" },
      { id: "cricket-retro-band", name: "Retro Band", sport: "Cricket" },
      { id: "cricket-pinstripe", name: "Pinstripe", sport: "Cricket" },
      { id: "cricket-shadow-fade", name: "Shadow Fade", sport: "Cricket" },
      { id: "cricket-split-panel", name: "Split Panel", sport: "Cricket" },
    ],
    addons: [
      {
        id: "shorts",
        name: "Shorts",
        styles: [
          { id: "shorts-normal", label: "Normal", price: 220 },
          { id: "shorts-number-print", label: "Number Print", price: 265 },
          { id: "shorts-number-logo", label: "Number + Logo", price: 320 },
          { id: "shorts-stripe-logo-number", label: "Stripe + Logo + Number Print", price: 400 },
          { id: "shorts-full-design", label: "Full Design Print", price: 700 },
        ],
      },
      {
        id: "track",
        name: "Track",
        // Only "Normal" price (₹500) was given so far - other tiers below
        // are placeholders scaled from Shorts' pricing ratio, pending real
        // numbers (editable later via the admin panel's Addon CRUD).
        styles: [
          { id: "track-normal", label: "Normal", price: 500 },
          { id: "track-number-print", label: "Number Print", price: 600 },
          { id: "track-number-logo", label: "Number + Logo", price: 725 },
          { id: "track-stripe-logo-number", label: "Stripe + Logo + Number Print", price: 900 },
          { id: "track-full-design", label: "Full Design Print", price: 1600 },
        ],
      },
    ],
    pricingTiers: [],
    quantityDiscount: { type: "quantity_tier", minQuantity: 50, percentOff: 5 },
    currency: "₹",
  },
}

export function getProductByCategory(categoryId: string): ProductDetail | null {
  return MOCK_PRODUCTS[categoryId] ?? null
}

export function sportToSlug(sport: string): string {
  return sport.toLowerCase().replace(/\s+/g, "-")
}

export function slugToSport(product: ProductDetail, slug: string): string | null {
  return product.applicableSports.find((s) => sportToSlug(s) === slug) ?? null
}

// Returns a copy of the product with designs filtered to only the given
// sport, so the customizer downstream never has to know about sports at all.
export function getProductForSport(product: ProductDetail, sport: string): ProductDetail {
  return {
    ...product,
    designs: product.designs.filter((d) => d.sport === sport),
  }
}

// A single mock coupon, checked against whatever the customer types in.
export const MOCK_COUPON = { code: "WELCOME500", amountOff: 500 }
