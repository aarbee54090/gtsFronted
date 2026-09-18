import type { OrderDraft } from "./order-draft"

export interface SavedOrder {
  _id: string
  draft: OrderDraft
  createdAt: string
}
