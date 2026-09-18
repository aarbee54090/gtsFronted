export type HubSectionKey = "portfolio" | "new-arrivals" | "materials" | "journal" | "about" | "contact"

export interface HubSectionImage {
  _id: string
  sectionKey: HubSectionKey
  desktopImageUrl?: string
  mobileImageUrl?: string
}

export const HUB_SECTION_KEYS: HubSectionKey[] = [
  "portfolio",
  "new-arrivals",
  "materials",
  "journal",
  "about",
  "contact",
]

export const HUB_SECTION_LABELS: Record<HubSectionKey, string> = {
  portfolio: "Portfolio",
  "new-arrivals": "New Arrivals",
  materials: "Materials",
  journal: "Journal",
  about: "About Us",
  contact: "Contact Us",
}
