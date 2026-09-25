"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Card } from "@/components/customize/Card"
import { RequireCustomer } from "@/components/account/RequireCustomer"
import { AccountNav } from "@/components/account/AccountNav"
import { apiFetch } from "@/lib/api"
import type { AdminOrder } from "@/lib/admin-types"

const STATUS_STYLES: Record<AdminOrder["status"], string> = {
  pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  approved: "text-[var(--color-brand-green)] border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/10",
  rejected: "text-[var(--color-error-red)] border-[var(--color-error-red)]/40 bg-[var(--color-error-red)]/10",
}

function formatMoney(currency: string, amount: number) {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function MyOrdersList() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ success: boolean; data: AdminOrder[] }>("/orders/mine")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>
  if (orders.length === 0) {
    return <p className="text-sm text-[var(--color-text-gray)]">You haven&apos;t placed any orders yet.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Card key={order._id} className="flex flex-col gap-4 p-6">
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
              <span>Total</span>
              <span className="font-bold text-white">
                {formatMoney(order.priceBreakdown.currency, order.priceBreakdown.total)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--color-text-gray)]">
              <span>Advance paid</span>
              <span>{formatMoney(order.priceBreakdown.currency, order.advanceAmount)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-gray)]">
              <span>Balance due on completion</span>
              <span>{formatMoney(order.priceBreakdown.currency, order.balanceAmount)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function MyOrdersPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-32">
        <h1 className="mb-6 text-3xl font-bold text-white">My Orders</h1>
        <RequireCustomer>
          <AccountNav />
          <MyOrdersList />
        </RequireCustomer>
      </div>
    </div>
  )
}
