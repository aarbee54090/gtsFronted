import type { MediaItem } from "./gts-hub-types"

export interface Platform {
  _id: string
  name: string
  slug: string
  url: string
  description?: string
  logo?: MediaItem
  order: number
  status: "draft" | "published"
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
