"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Card } from "@/components/customize/Card"
import { RequireCustomer } from "@/components/account/RequireCustomer"
import { AccountNav } from "@/components/account/AccountNav"
import { apiFetch } from "@/lib/api"
import { saveOrderDraft } from "@/lib/order-draft"
import type { SavedOrder } from "@/lib/saved-order-types"

function formatMoney(currency: string, amount: number) {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function SavedOrdersList() {
  const router = useRouter()
  const [items, setItems] = useState<SavedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<{ success: boolean; data: SavedOrder[] }>("/saved-orders")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }, [])

  function handleResume(item: SavedOrder) {
    // Restore the draft to sessionStorage exactly as the customizer would
    // have left it, then drop them at Checkout to finish paying - this is
    // an order already quoted, not a design to reconfigure from scratch.
    saveOrderDraft(item.draft)
    router.push(`/customize/${item.draft.categoryId}/${item.draft.sportSlug}/checkout`)
  }

  async function handleDelete(id: string) {
    setRemovingId(id)
    try {
      await apiFetch(`/saved-orders/${id}`, { method: "DELETE" })
      setItems((prev) => prev.filter((i) => i._id !== id))
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-gray)]">
        No saved orders yet - use &quot;Save for later&quot; on a quotation to keep it here.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const { draft } = item
        return (
          <Card key={item._id} className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              {draft.designImageUrl && (
                <Image
                  src={draft.designImageUrl}
                  alt={draft.designName}
                  width={56}
                  height={72}
                  unoptimized={draft.designImageUrl.startsWith("data:")}
                  className="h-18 w-14 rounded-[var(--radius-sm)] object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-gray)]">
                  {draft.productName}
                </p>
                <p className="text-sm font-bold text-white">{draft.designName}</p>
                <p className="text-xs text-[var(--color-text-gray)]">Qty: {draft.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--color-text-gray)]">Total</p>
                <p className="text-lg font-extrabold text-white">
                  {formatMoney(draft.quote.currency, draft.quote.total)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
              <p className="text-xs text-[var(--color-text-gray)]">
                Saved {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  disabled={removingId === item._id}
                  className="text-xs font-semibold text-[var(--color-error-red)] hover:underline disabled:opacity-50"
                >
                  {removingId === item._id ? "Removing..." : "Remove"}
                </button>
                <button
                  type="button"
                  onClick={() => handleResume(item)}
                  className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2 text-xs font-bold text-[var(--color-bg-dark)]"
                >
                  Resume →
                </button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default function SavedOrdersPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-32">
        <h1 className="mb-6 text-3xl font-bold text-white">Saved Orders</h1>
        <RequireCustomer>
          <AccountNav />
          <SavedOrdersList />
        </RequireCustomer>
      </div>
    </div>
  )
}
