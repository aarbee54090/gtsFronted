"use client"

import { useState } from "react"
import Image from "next/image"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Card } from "@/components/customize/Card"
import { ApiError, trackOrder, type OrderTracking } from "@/lib/api"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-4 py-3 text-sm uppercase text-white placeholder:normal-case placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

const STATUS_STYLES: Record<OrderTracking["status"], string> = {
  pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  approved: "text-[var(--color-brand-green)] border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/10",
  rejected: "text-[var(--color-error-red)] border-[var(--color-error-red)]/40 bg-[var(--color-error-red)]/10",
}

const STATUS_MESSAGES: Record<OrderTracking["status"], string> = {
  pending: "We've received your order and payment receipt. Our team is reviewing it.",
  approved: "Your order has been approved and is being made.",
  rejected: "Your order couldn't be approved. Please contact us for details.",
}

function formatMoney(currency: string, amount: number) {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = orderId.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      setOrder(await trackOrder(id))
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "No order found with that ID. Please check it and try again."
          : "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-32">
        <h1 className="mb-2 text-3xl font-bold text-white">Track Your Order</h1>
        <p className="mb-6 text-sm text-[var(--color-text-gray)]">
          Enter the order ID you received after confirming your order (it looks like GTS-XXXXXXXX).
        </p>

        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="track-order-id" className="sr-only">
            Order ID
          </label>
          <input
            id="track-order-id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="GTS-XXXXXXXX"
            autoComplete="off"
            className={inputClasses}
          />
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && (
          <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
            {error}
          </p>
        )}

        {order && (
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-gray)]">
                  {order.orderId}
                </p>
                <p className="text-lg font-bold text-white">
                  {order.productName} — {order.sport}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>

            <p className="text-sm text-[var(--color-text-gray)]">{STATUS_MESSAGES[order.status]}</p>

            <div className="flex items-center gap-3 border-t border-[var(--glass-border)] pt-4">
              {order.designImageUrl && (
                <Image
                  src={order.designImageUrl}
                  alt={order.designName}
                  width={56}
                  height={72}
                  unoptimized={order.designImageUrl.startsWith("data:")}
                  className="h-18 w-14 rounded-[var(--radius-sm)] object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium text-white">{order.designName}</p>
                <p className="text-xs text-[var(--color-text-gray)]">Qty: {order.quantity}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-[var(--glass-border)] pt-4 text-sm">
              <div className="flex justify-between text-[var(--color-text-gray)]">
                <span>Ordered on</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.deadlineDate && (
                <div className="flex justify-between text-[var(--color-text-gray)]">
                  <span>Deadline</span>
                  <span>{formatDate(order.deadlineDate)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-text-gray)]">
                <span>Total</span>
                <span className="font-bold text-white">{formatMoney(order.currency, order.total)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-gray)]">
                <span>Advance paid</span>
                <span>{formatMoney(order.currency, order.advanceAmount)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-gray)]">
                <span>Balance due on completion</span>
                <span>{formatMoney(order.currency, order.balanceAmount)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
