"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Download, BookmarkPlus } from "lucide-react"

import { loadOrderDraft, type OrderDraft } from "@/lib/order-draft"
import { useCustomerAuth } from "@/components/account/CustomerAuthContext"
import { setPendingAction } from "@/lib/pending-action"
import { apiFetch } from "@/lib/api"
import { Card } from "./Card"

function formatMoney(currency: string, amount: number) {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function QuotationPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { customer } = useCustomerAuth()
  const [draft, setDraft] = useState<OrderDraft | null | undefined>(undefined) // undefined = not checked yet
  const [saving, setSaving] = useState(false)
  const [savedJustNow, setSavedJustNow] = useState(false)

  useEffect(() => {
    // Deliberate exception to react-hooks/set-state-in-effect: sessionStorage
    // can only be read after mount - same pattern as CheckoutPage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadOrderDraft())
  }, [])

  if (draft === undefined) {
    return null // avoid a flash before we've checked sessionStorage
  }

  if (!draft) {
    return (
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold text-white">No order in progress</h1>
        <p className="text-sm text-[var(--color-text-gray)]">
          Start customizing a product to get a quotation.
        </p>
        <Link
          href="/products"
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)]"
        >
          Browse Products
        </Link>
      </Card>
    )
  }

  const { quote } = draft

  // Rebuilt directly from the draft's own structured fields - no separate
  // "descriptionLines" needed in the draft itself.
  const descriptionLines = [
    `Design: ${draft.designName}`,
    ...draft.sleeveBreakdown.map((s) => `${s.label}: ${s.quantity} pc`),
    ...draft.collarBreakdown.map((c) => `${c.label}: ${c.quantity} pc`),
    ...draft.addonLines.map((a) => `${a.addonName} (${a.styleLabel}) x${a.quantity}`),
  ]

  // Same simplified label logic as before, using only what's in the saved
  // quote - the specific bulk-discount percent/threshold isn't saved in the
  // draft, so this is a generic label rather than the exact numbers.
  const discountLabel =
    quote.discount <= 0 ? null : quote.quantityDiscount >= quote.couponDiscount ? "Bulk discount" : "Coupon discount"

  function handleDownloadQuotation() {
    const lines = [
      `GTS Quotation — ${draft!.productName}`,
      `Design: ${draft!.designName}`,
      "",
      ...descriptionLines,
      "",
      `Quantity: ${draft!.quantity}`,
      `Unit price: ${quote.currency}${quote.unitPrice}`,
      `Line total: ${quote.currency}${quote.lineTotal}`,
      quote.variantSurcharge > 0 ? `Sleeve/Collar surcharge: ${quote.currency}${quote.variantSurcharge}` : null,
      quote.addonsTotal > 0 ? `Addons: ${quote.currency}${quote.addonsTotal}` : null,
      quote.discount > 0 ? `Discount: -${quote.currency}${quote.discount}` : null,
      draft!.deadlineDate ? `Deadline: ${draft!.deadlineDate}` : null,
      draft!.couponCode ? `Coupon: ${draft!.couponCode}` : null,
      "",
      `Total: ${quote.currency}${quote.total}`,
      "",
      "Estimated preview — final price confirmed at checkout.",
    ].filter((line): line is string => line !== null)

    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `GTS-Quotation-${draft!.productName.replace(/\s+/g, "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSaveForLater() {
    if (!customer) {
      // Register-first: stash the whole draft so it saves automatically
      // right after they create an account, instead of losing it.
      setPendingAction({ type: "save-order", draft: draft! })
      router.push(`/account/register?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    setSaving(true)
    try {
      await apiFetch("/saved-orders", { method: "POST", body: { draft } })
      setSavedJustNow(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/customize/${draft.categoryId}/${draft.sportSlug}`}
        className="text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
      >
        ← Back to customize
      </Link>

      <Card className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Your Quotation</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSaveForLater}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-green)] hover:underline disabled:opacity-50"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              {savedJustNow ? "Saved!" : saving ? "Saving..." : "Save for later"}
            </button>
            <button
              type="button"
              onClick={handleDownloadQuotation}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              Download Quotation
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {draft.designImageUrl && (
            <Image
              src={draft.designImageUrl}
              alt={draft.designName}
              width={64}
              height={80}
              unoptimized={draft.designImageUrl.startsWith("data:")}
              className="h-20 w-16 rounded-[var(--radius-sm)] object-cover"
            />
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-gray)]">
              {draft.productName}
            </p>
            <p className="text-sm font-bold text-white">{draft.designName}</p>
          </div>
        </div>

        {descriptionLines.length > 0 && (
          <ul className="glass-surface flex flex-col gap-1 rounded-[var(--radius-md)] p-3 text-xs text-[var(--color-text-gray)]">
            {descriptionLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}

        {(draft.deadlineDate || draft.couponCode) && (
          <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-gray)]">
            {draft.deadlineDate && (
              <span>
                Deadline: <span className="text-white">{draft.deadlineDate}</span>
              </span>
            )}
            {draft.couponCode && (
              <span>
                Coupon: <span className="text-white">{draft.couponCode}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5 border-t border-[var(--glass-border)] pt-4 text-sm">
          <div className="flex justify-between text-[var(--color-text-gray)]">
            <span>Quantity</span>
            <span>{draft.quantity || "—"}</span>
          </div>
          <div className="flex justify-between text-[var(--color-text-gray)]">
            <span>Unit price</span>
            <span>{formatMoney(quote.currency, quote.unitPrice)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-text-gray)]">
            <span>Line total</span>
            <span>{formatMoney(quote.currency, quote.lineTotal)}</span>
          </div>
          {quote.variantSurcharge > 0 && (
            <div className="flex justify-between text-[var(--color-text-gray)]">
              <span>Sleeve/Collar surcharge</span>
              <span>{formatMoney(quote.currency, quote.variantSurcharge)}</span>
            </div>
          )}
          {quote.addonsTotal > 0 && (
            <div className="flex justify-between text-[var(--color-text-gray)]">
              <span>Addons</span>
              <span>{formatMoney(quote.currency, quote.addonsTotal)}</span>
            </div>
          )}
          {quote.discount > 0 && (
            <div className="flex justify-between font-medium text-[var(--color-brand-green)]">
              <span>{discountLabel ?? "Discount"}</span>
              <span>−{formatMoney(quote.currency, quote.discount)}</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between border-t border-[var(--glass-border)] pt-4">
          <span className="text-sm font-semibold text-white">Total</span>
          <span className="text-2xl font-extrabold text-white" data-testid="order-total">
            {formatMoney(quote.currency, quote.total)}
          </span>
        </div>

        <Link
          href={`/customize/${draft.categoryId}/${draft.sportSlug}/checkout`}
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-center text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:-translate-y-0.5"
        >
          Proceed to Checkout →
        </Link>
        <p className="text-center text-xs text-[var(--color-text-gray)]">
          Estimated preview — final price confirmed at checkout.
        </p>
      </Card>
    </div>
  )
}
