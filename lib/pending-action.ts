import type { OrderDraft } from "./order-draft"
import type { SavedDesign } from "./saved-design-types"

const PENDING_ACTION_KEY = "gts_pending_action"

export type PendingAction =
  | {
      type: "save-design"
      itemType: SavedDesign["itemType"]
      itemId: string
      name: string
      imageUrl?: string
      categoryId?: string
      sportSlug?: string
      slug?: string
    }
  | { type: "save-order"; draft: OrderDraft }

export function setPendingAction(action: PendingAction) {
  try {
    localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action))
  } catch {
    // localStorage can throw in private-browsing/storage-full edge cases -
    // worst case the guest just has to redo the click after logging in.
  }
}

/** Reads and clears the pending action in one step - it's meant to fire exactly once. */
export function takePendingAction(): PendingAction | null {
  try {
    const raw = localStorage.getItem(PENDING_ACTION_KEY)
    if (!raw) return null
    localStorage.removeItem(PENDING_ACTION_KEY)
    return JSON.parse(raw) as PendingAction
  } catch {
    return null
  }
}
