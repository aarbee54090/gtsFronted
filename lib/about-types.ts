import type { MediaItem, SeoFields } from "./gts-hub-types"

export interface AboutPage {
  _id: string
  heading?: string
  body?: string
  heroImage?: MediaItem
  seo?: SeoFields
}
