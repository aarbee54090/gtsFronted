"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Upload, CheckCircle2, Copy } from "lucide-react"

import { loadOrderDraft, clearOrderDraft, type OrderDraft } from "@/lib/order-draft"
import { apiFetch, ApiError } from "@/lib/api"
import type { ApiItemResponse, PaymentConfig, PaymentMethod } from "@/lib/admin-types"
import { useCustomerAuth } from "@/components/account/CustomerAuthContext"
import { Card } from "./Card"

function formatMoney(currency: string, amount: number) {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

const inputClasses =
  "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

export function CheckoutPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { customer, loading: authLoading } = useCustomerAuth()
  const [draft, setDraft] = useState<OrderDraft | null | undefined>(undefined) // undefined = not checked yet
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Placing an order requires an account - send guests to log in/register
  // and back here afterward rather than letting them fill the whole form
  // and hit a 401 on submit.
  useEffect(() => {
    if (!authLoading && !customer) {
      router.replace(`/account/register?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [authLoading, customer, pathname, router])

  // Prefill from the account once known - still editable, e.g. for a
  // different shipping contact than the account holder.
  useEffect(() => {
    if (!customer) return
    setName((prev) => prev || customer.name)
    setPhone((prev) => prev || customer.phone)
    setAddress((prev) => prev || customer.address)
  }, [customer])

  useEffect(() => {
    // Deliberate exception to react-hooks/set-state-in-effect: sessionStorage
    // can only be read after mount (no server-side equivalent), so this is
    // the earliest point the draft can be checked.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadOrderDraft())

    apiFetch<ApiItemResponse<PaymentConfig>>("/payment-config")
      .then((res) => {
        const methods = res.data.methods ?? []
        setPaymentMethods(methods)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMethod(methods[0] ?? null)
      })
      .catch(() => {
        // Not set up yet - the placeholder box below covers this case.
      })
  }, [])

  const receiptPreviewUrl = useMemo(
    () => (receiptFile ? URL.createObjectURL(receiptFile) : null),
    [receiptFile]
  )
  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl)
    }
  }, [receiptPreviewUrl])

  async function handleConfirmOrder() {
    if (!draft || !receiptFile) return
    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set("productName", draft.productName)
      formData.set("category", draft.categoryId)
      formData.set("sport", draft.sportSlug)
      formData.set("designName", draft.designName)
      if (draft.designImageUrl) formData.set("designImageUrl", draft.designImageUrl)
      formData.set("quantity", String(draft.quantity))
      formData.set("sleeveBreakdown", JSON.stringify(draft.sleeveBreakdown))
      formData.set("collarBreakdown", JSON.stringify(draft.collarBreakdown))
      formData.set("addonLines", JSON.stringify(draft.addonLines))
      formData.set("players", JSON.stringify(draft.players))
      formData.set("priceBreakdown", JSON.stringify(draft.quote))
      formData.set("contact", JSON.stringify({ name, phone, email: email || undefined }))
      formData.set("address", address)
      formData.set("paymentMethod", selectedMethod?.type ?? "")
      if (draft.deadlineDate) formData.set("deadlineDate", draft.deadlineDate)
      if (draft.couponCode) formData.set("couponCode", draft.couponCode)
      formData.set("receipt", receiptFile)

      for (const { filename, dataUrl } of draft.additionalFiles) {
        const blob = await (await fetch(dataUrl)).blob()
        formData.append("additionalFiles", blob, filename)
      }

      const res = await apiFetch<ApiItemResponse<{ orderId: string }>>("/orders", {
        method: "POST",
        body: formData,
      })

      setOrderId(res.data.orderId)
      clearOrderDraft()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !customer) {
    return null // avoid a flash of the form before the login redirect kicks in
  }

  if (draft === undefined) {
    return null // avoid a flash before we've checked sessionStorage
  }

  if (orderId) {
    return (
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-[var(--color-brand-green)]" />
        <h1 className="text-2xl font-bold text-white">Order Submitted</h1>
        <p className="text-sm text-[var(--color-text-gray)]">
          Save this order ID to track your order later.
        </p>
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-6 py-3">
          <span className="text-xl font-bold tracking-wide text-[var(--color-brand-green)]">
            {orderId}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(orderId)}
            aria-label="Copy order ID"
            className="text-[var(--color-text-gray)] hover:text-white"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <Link
          href="/"
          className="mt-2 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)]"
        >
          Back to Home
        </Link>
      </Card>
    )
  }

  if (!draft) {
    return (
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <h1 className="text-xl font-bold text-white">No order in progress</h1>
        <p className="text-sm text-[var(--color-text-gray)]">
          Start customizing a product to reach checkout.
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

  const advanceAmount = Math.round(draft.quote.total * 0.4)
  const remainingAmount = draft.quote.total - advanceAmount
  const canConfirm = Boolean(
    receiptFile && name.trim() && phone.trim() && address.trim() && selectedMethod && !submitting
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/customize/${draft.categoryId}/${draft.sportSlug}`}
          className="mb-3 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
        >
          ← Back to customize
        </Link>
        <h1 className="text-2xl font-bold text-white">Confirm &amp; Pay</h1>
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Order Recap
        </h2>
        <div className="flex items-center gap-3">
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
          <div>
            <p className="font-bold text-white">{draft.productName}</p>
            <p className="text-sm text-[var(--color-text-gray)]">{draft.designName}</p>
          </div>
        </div>
        <ul className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
          {draft.sleeveBreakdown.map((s) => (
            <li key={s.label}>{s.label}: {s.quantity} pc</li>
          ))}
          {draft.collarBreakdown.map((c) => (
            <li key={c.label}>{c.label}: {c.quantity} pc</li>
          ))}
          {draft.addonLines.map((a) => (
            <li key={`${a.addonName}-${a.styleLabel}`}>
              {a.addonName} ({a.styleLabel}) x{a.quantity}
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-[var(--glass-border)] pt-3">
          <span className="text-sm font-semibold text-white">Total</span>
          <span className="text-xl font-extrabold text-white">
            {formatMoney(draft.quote.currency, draft.quote.total)}
          </span>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Payment Split
        </h2>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-gray)]">Advance (40%) — pay now</span>
          <span className="font-bold text-[var(--color-brand-green)]">
            {formatMoney(draft.quote.currency, advanceAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-gray)]">Balance (60%) — on completion</span>
          <span className="font-bold text-white">
            {formatMoney(draft.quote.currency, remainingAmount)}
          </span>
        </div>
      </Card>

      <Card className="flex flex-col items-center gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Pay With
        </h2>
        {paymentMethods.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method._id ?? method.type}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedMethod?._id === method._id
                      ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
                      : "border-[var(--glass-border)] text-[var(--color-text-gray)] hover:text-white"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {selectedMethod && (
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={selectedMethod.qrCodeImageUrl}
                  alt={`${selectedMethod.label} QR code`}
                  width={192}
                  height={192}
                  className="h-48 w-48 rounded-[var(--radius-md)] object-contain"
                />
                {selectedMethod.details && (
                  <div className="flex flex-col gap-1 text-center text-xs text-[var(--color-text-gray)]">
                    {selectedMethod.details.accountName && (
                      <p>Account Name: <span className="text-white">{selectedMethod.details.accountName}</span></p>
                    )}
                    {selectedMethod.details.accountNumber && (
                      <p>Account Number: <span className="text-white">{selectedMethod.details.accountNumber}</span></p>
                    )}
                    {selectedMethod.details.bankName && (
                      <p>Bank: <span className="text-white">{selectedMethod.details.bankName}</span></p>
                    )}
                    {selectedMethod.details.branch && (
                      <p>Branch: <span className="text-white">{selectedMethod.details.branch}</span></p>
                    )}
                    {selectedMethod.details.ifsc && (
                      <p>IFSC: <span className="text-white">{selectedMethod.details.ifsc}</span></p>
                    )}
                    {selectedMethod.details.upiId && (
                      <p>UPI ID: <span className="text-white">{selectedMethod.details.upiId}</span></p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-gray-600 text-xs text-gray-500">
            Payment methods not set up yet
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Your Details
        </h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className="text-sm font-semibold text-white">
            Name <span className="text-[var(--color-error-red)]">*</span>
          </label>
          <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-phone" className="text-sm font-semibold text-white">
            Phone <span className="text-[var(--color-error-red)]">*</span>
          </label>
          <input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className="text-sm font-semibold text-white">
            Email (optional)
          </label>
          <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-address" className="text-sm font-semibold text-white">
            Address <span className="text-[var(--color-error-red)]">*</span>
          </label>
          <textarea
            id="contact-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={`${inputClasses} resize-none`}
            placeholder="Street, city, district"
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Upload Payment Receipt
        </h2>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-gray-600 py-6 text-sm text-[var(--color-text-gray)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]">
          <Upload className="h-5 w-5" />
          {receiptFile ? receiptFile.name : "Click to upload your payment screenshot"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {receiptPreviewUrl && (
          <Image
            src={receiptPreviewUrl}
            alt="Payment receipt preview"
            width={200}
            height={200}
            unoptimized
            className="mx-auto max-h-48 w-auto rounded-[var(--radius-md)] object-contain"
          />
        )}
      </Card>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-center text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirmOrder}
        disabled={!canConfirm}
        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Submitting..." : "Confirm Order"}
      </button>
      {!canConfirm && !submitting && (
        <p className="text-center text-xs text-[var(--color-error-red)]">
          Enter your name, phone, address, select a payment method, and upload your payment receipt to confirm.
        </p>
      )}
    </div>
  )
}
