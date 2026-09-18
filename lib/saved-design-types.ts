export interface SavedDesign {
  _id: string
  itemType: "catalog" | "portfolio" | "journal" | "new-arrival" | "material"
  itemId: string
  name: string
  imageUrl?: string
  /** Only set for itemType "catalog" - which product/sport this design belongs to, so a saved card can link back to the customizer. */
  categoryId?: string
  sportSlug?: string
  /** Set for GTS Hub content types - detail pages route by slug, not by the Mongo _id stored in itemId. */
  slug?: string
  createdAt: string
}
