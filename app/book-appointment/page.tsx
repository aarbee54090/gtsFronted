"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { useCustomerAuth } from "@/components/account/CustomerAuthContext"
import { ApiError, bookAppointment, getAvailability } from "@/lib/api"
import type { Availability } from "@/lib/appointment-types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function toHHMM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function formatTime12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`
}

export default function BookAppointmentPage() {
  const { customer } = useCustomerAuth()

  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Availability | null>(null)
  const [offsetMinutes, setOffsetMinutes] = useState(0)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getAvailability()
      .then(setAvailability)
      .catch((err: unknown) => setLoadError(err instanceof ApiError ? err.message : "Failed to load availability."))
      .finally(() => setLoading(false))
  }, [])

  const durationMinutes =
    selected?.startTime && selected?.endTime ? toMinutes(selected.endTime) - toMinutes(selected.startTime) : 0
  const selectedTime = selected?.startTime ? toHHMM(toMinutes(selected.startTime) + offsetMinutes) : ""

  function selectDate(entry: Availability) {
    if (entry.status !== "available" || !entry.startTime || !entry.endTime) return
    setSelected(entry)
    setOffsetMinutes(Math.floor((toMinutes(entry.endTime) - toMinutes(entry.startTime)) / 2))
    setName("")
    setPhone("")
    setNote("")
    setFormError(null)
    setSubmitted(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setFormError(null)

    const bookingName = customer ? customer.name : name.trim()
    const bookingPhone = customer ? customer.phone : phone.trim()
    if (!bookingName || !bookingPhone) {
      setFormError("Name and phone are required.")
      return
    }

    setSubmitting(true)
    try {
      await bookAppointment({
        date: selected.date,
        time: selectedTime,
        name: bookingName,
        phone: bookingPhone,
        note: note.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to submit request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />

      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-32">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
          Book a Visit
        </p>
        <h1 className="mb-8 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">Schedule an Appointment</h1>

        {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading available dates...</p>}
        {loadError && <p className="text-sm text-[var(--color-error-red)]">{loadError}</p>}

        {!loading && !loadError && availability.length === 0 && (
          <p className="text-sm text-[var(--color-text-gray)]">No dates are open for booking right now.</p>
        )}

        {!loading && availability.length > 0 && (
          <div className="flex flex-col gap-3">
            {availability.map((entry) => {
              const isDayOff = entry.status !== "available"
              const isSelected = selected?._id === entry._id
              return (
                <div
                  key={entry._id}
                  className={`rounded-[var(--radius-lg)] border p-5 backdrop-blur-[16px] transition-colors ${
                    isSelected
                      ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{formatDate(entry.date)}</p>
                      <p className="text-sm text-[var(--color-text-gray)]">
                        {isDayOff
                          ? "Day Off"
                          : `Available: ${formatTime12h(entry.startTime!)} – ${formatTime12h(entry.endTime!)}`}
                      </p>
                    </div>
                    {!isDayOff && (
                      <button
                        type="button"
                        onClick={() => selectDate(entry)}
                        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2 text-sm font-bold text-[var(--color-bg-dark)]"
                      >
                        {isSelected ? "Selected" : "Book a Visit"}
                      </button>
                    )}
                  </div>

                  {isSelected && !submitted && (
                    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 border-t border-[var(--glass-border)] pt-5">
                      <div>
                        <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Your Visit Time</label>
                        <input
                          type="range"
                          min={0}
                          max={durationMinutes}
                          step={1}
                          value={offsetMinutes}
                          onChange={(e) => setOffsetMinutes(Number(e.target.value))}
                          className="w-full accent-[var(--color-brand-green)]"
                        />
                        <div className="mt-1 flex justify-between text-xs text-[var(--color-text-gray)]">
                          <span>{formatTime12h(entry.startTime!)}</span>
                          <span className="font-bold text-white">{formatTime12h(selectedTime)}</span>
                          <span>{formatTime12h(entry.endTime!)}</span>
                        </div>
                      </div>

                      {customer ? (
                        <p className="text-sm text-[var(--color-text-gray)]">
                          Booking as <span className="font-bold text-white">{customer.name}</span> ·{" "}
                          {customer.phone}
                        </p>
                      ) : (
                        <>
                          <div>
                            <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Phone</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Leave a Note (optional)</label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          className="w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
                        />
                      </div>

                      {formError && <p className="text-sm text-[var(--color-error-red)]">{formError}</p>}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
                      >
                        {submitting ? "Submitting..." : "Request Appointment"}
                      </button>
                    </form>
                  )}

                  {isSelected && submitted && (
                    <p className="mt-5 border-t border-[var(--glass-border)] pt-5 text-sm text-[var(--color-brand-green)]">
                      Request submitted — we&apos;ll confirm your appointment soon.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
