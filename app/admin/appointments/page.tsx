"use client"

import { useState } from "react"
import Link from "next/link"
import { AppointmentsPanel } from "@/components/admin/appointments/AppointmentsPanel"
import { SlotsPanel } from "@/components/admin/appointments/SlotsPanel"

type Tab = "appointments" | "availability"

export default function AdminAppointmentsPage() {
  const [tab, setTab] = useState<Tab>("appointments")

  return (
    <div>
      <Link href="/admin" className="mb-4 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-white">
        ← Dashboard
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-white">Appointments</h1>
      <p className="mb-6 max-w-2xl text-sm text-[var(--color-text-gray)]">
        Customers book in-person visits from the Contact Us page. New bookings arrive as <strong>requested</strong> -
        confirm them here. All times are Nepal time (Asia/Kathmandu). Customers aren&apos;t notified automatically, so
        call or message them when you confirm, reschedule, or cancel.
      </p>

      <div role="tablist" aria-label="Appointments sections" className="mb-6 flex gap-2 border-b border-[var(--glass-border)]">
        {(
          [
            ["appointments", "Bookings"],
            ["availability", "Availability"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === key
                ? "border-[var(--color-brand-green)] text-white"
                : "border-transparent text-[var(--color-text-gray)] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">{tab === "appointments" ? <AppointmentsPanel /> : <SlotsPanel />}</div>
    </div>
  )
}
