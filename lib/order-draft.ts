import type { QuoteBreakdown } from "./pricing"
import type { PlayerRow } from "./types"

const ORDER_DRAFT_KEY = "gts_order_draft"

export interface OrderDraft {
  productName: string
  designName: string
  designImageUrl?: string
  categoryId: string
  sportSlug: string
  sleeveBreakdown: { label: string; quantity: number }[]
  collarBreakdown: { label: string; quantity: number }[]
  addonLines: { addonName: string; styleLabel: string; quantity: number; price: number }[]
  players: PlayerRow[]
  /** Data URLs, not File objects - sessionStorage can only hold strings. */
  additionalFiles: { filename: string; dataUrl: string }[]
  quantity: number
  deadlineDate: string
  couponCode: string
  quote: QuoteBreakdown
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result)
      else reject(new Error("Failed to read file"))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function saveOrderDraft(draft: OrderDraft) {
  sessionStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft))
}

export function loadOrderDraft(): OrderDraft | null {
  const raw = sessionStorage.getItem(ORDER_DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OrderDraft
  } catch {
    return null
  }
}

export function clearOrderDraft() {
  sessionStorage.removeItem(ORDER_DRAFT_KEY)
}

// Non-sequential, hard-to-guess order ID, matching the shape the real
// backend will eventually generate. This is a frontend-only mock — it is
// NOT saved anywhere, so it can't actually be looked up later until the
// real backend order-creation endpoint exists.
export function generateMockOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no ambiguous chars (0/O, 1/I)
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `GTS-${code}`
}
