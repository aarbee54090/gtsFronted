"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { ApiError, adminBulkCreateSlots, adminDeleteSlot, adminListSlots, adminUpdateSlot } from "@/lib/api"
import type { AdminSlot, BulkSlotResult } from "@/lib/appointment-types"
import { addDaysToDateKey, formatDateKey, formatTimeRange, kathmanduToday } from "@/lib/appointments"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
const labelClasses = "flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-gray)]"
const smallButton =
  "rounded-[var(--radius-pill)] border px-3.5 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
const primaryButton =
  "w-fit rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2.5 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
const panelClasses = "rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function message(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback
}

/**
 * Visiting hours: one slot per day. Customers pick an arrival time inside a
 * day's slot (every 15 minutes), and any number of customers can book the
 * same time.
 */
export function SlotsPanel() {
  const today = useMemo(() => kathmanduToday(), [])
  const [range, setRange] = useState({ from: today, to: addDaysToDateKey(today, 30) })
  const [slots, setSlots] = useState<AdminSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  // When the list was last loaded (marks past days) - never read from the
  // clock during render.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    adminListSlots(range.from, range.to)
      .then((data) => {
        if (cancelled) return
        setSlots(data)
        setError(null)
        setNow(Date.now())
      })
      .catch((err: unknown) => !cancelled && setError(message(err, "Failed to load slots.")))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [range, reloadKey])

  function reload() {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  const bookings = slots.reduce((sum, s) => sum + s.bookings, 0)

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-sm text-[var(--color-text-gray)]">
        Add your visiting hours - one slot per day. Customers choose a time inside it to arrive, and any number of
        customers can book the same time. They only ever see the days you add here.
      </p>

      <AddSlotForm defaultDate={today} onCreated={reload} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
            <h2 className="text-lg font-bold text-white">Slots</h2>
            {!loading && slots.length > 0 && (
              <p className="text-xs text-[var(--color-text-gray)]">
                {slots.length} {slots.length === 1 ? "day" : "days"} in this range · {bookings}{" "}
                {bookings === 1 ? "booking" : "bookings"}
              </p>
            )}
          </div>
          <label className={labelClasses}>
            From
            <input
              type="date"
              value={range.from}
              onChange={(e) => {
                setLoading(true)
                setRange((r) => ({ ...r, from: e.target.value || today }))
              }}
              className={inputClasses}
            />
          </label>
          <label className={labelClasses}>
            To
            <input
              type="date"
              value={range.to}
              onChange={(e) => {
                setLoading(true)
                setRange((r) => ({ ...r, to: e.target.value || r.from }))
              }}
              className={inputClasses}
            />
          </label>
          <button type="button" onClick={reload} className={`${smallButton} flex items-center gap-1.5 border-[var(--glass-border)] text-white`}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
          </button>
        </div>

        {error && <p className="text-sm text-[var(--color-error-red)]">{error}</p>}
        {loading ? (
          <p className="text-sm text-[var(--color-text-gray)]">Loading slots…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-[var(--color-text-gray)]">
            No slots in this range. Customers can only book days you add here.
          </p>
        ) : (
          <ul className={`${panelClasses} flex flex-col divide-y divide-[var(--glass-border)] py-2`}>
            {slots.map((slot) => (
              <SlotRow key={slot._id} slot={slot} now={now} onChanged={reload} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function SlotRow({ slot, now, onChanged }: { slot: AdminSlot; now: number; onChanged: () => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ startTime: slot.startTime, endTime: slot.endTime, note: slot.note ?? "" })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const past = new Date(slot.endsAt).getTime() <= now
  const state = past ? "Past" : slot.isActive ? "Open" : "Hidden"

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(message(err, "Something went wrong."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex flex-col gap-3 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-52">
          <p className="text-sm font-bold text-white">{formatDateKey(slot.date)}</p>
          <p className="text-sm text-[var(--color-text-gray)]">{formatTimeRange(slot.startsAt, slot.endsAt)}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${
            state === "Open"
              ? "border-[var(--color-brand-green)]/50 text-[var(--color-brand-green)]"
              : "border-[var(--glass-border)] text-[var(--color-text-gray)]"
          }`}
        >
          {state}
        </span>
        <span className="text-xs font-semibold text-white">
          {slot.bookings} {slot.bookings === 1 ? "booking" : "bookings"}
        </span>
        {slot.note && <span className="text-xs text-[var(--color-text-gray)]">{slot.note}</span>}
        {!past && (
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => adminUpdateSlot(slot._id, { isActive: !slot.isActive }))}
              className={`${smallButton} border-[var(--glass-border)] text-white hover:border-[var(--color-brand-green)]`}
            >
              {slot.isActive ? "Hide" : "Show"}
            </button>
            <button type="button" disabled={busy} onClick={() => setEditing((v) => !v)} className={`${smallButton} border-[var(--glass-border)] text-white`}>
              Edit
            </button>
            <button
              type="button"
              disabled={busy || slot.bookings > 0}
              title={slot.bookings > 0 ? "Cancel or move this day's bookings first, or hide the day" : undefined}
              onClick={() => {
                if (!window.confirm(`Delete the slot on ${formatDateKey(slot.date)}?`)) return
                run(() => adminDeleteSlot(slot._id))
              }}
              className={`${smallButton} border-[var(--glass-border)] text-[var(--color-text-gray)] hover:border-[var(--color-error-red)] hover:text-[var(--color-error-red)]`}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            run(() => adminUpdateSlot(slot._id, draft))
          }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <label className={labelClasses}>
            Start time
            <input type="time" required value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} className={inputClasses} />
          </label>
          <label className={labelClasses}>
            End time
            <input type="time" required value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} className={inputClasses} />
          </label>
          <label className={`${labelClasses} col-span-2 sm:col-span-1`}>
            Note (admin only)
            <input value={draft.note} maxLength={200} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className={inputClasses} />
          </label>
          <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
            <button type="submit" disabled={busy} className={`${smallButton} border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-[var(--color-bg-dark)]`}>
              Save
            </button>
          </div>
          {slot.bookings > 0 && (
            <p className="col-span-2 text-xs text-[var(--color-text-gray)] sm:col-span-4">
              This day has bookings - new hours must still include their times.
            </p>
          )}
        </form>
      )}
      {error && <p className="text-sm text-[var(--color-error-red)]">{error}</p>}
    </li>
  )
}

/** The same hours on every ticked day between two dates - one slot per day. */
function AddSlotForm({ defaultDate, onCreated }: { defaultDate: string; onCreated: () => void }) {
  const [form, setForm] = useState({ fromDate: defaultDate, toDate: defaultDate, startTime: "16:00", endTime: "17:00" })
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<BulkSlotResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(await adminBulkCreateSlots({ ...form, weekdays }))
      onCreated()
    } catch (err) {
      setError(message(err, "Couldn't add the slot."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={`${panelClasses} flex max-w-2xl flex-col gap-4`}>
      <div>
        <h2 className="text-lg font-bold text-white">Add slot</h2>
        <p className="text-xs text-[var(--color-text-gray)]">
          Nepal time. One slot per day: the same hours on each ticked day between the two dates.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className={labelClasses}>
          From date
          <input
            type="date"
            required
            min={defaultDate}
            value={form.fromDate}
            onChange={(e) => {
              const fromDate = e.target.value
              setForm((f) => ({ ...f, fromDate, toDate: f.toDate < fromDate ? fromDate : f.toDate }))
            }}
            className={inputClasses}
          />
        </label>
        <label className={labelClasses}>
          To date
          <input type="date" required min={form.fromDate} value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Start time
          <input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClasses} />
        </label>
        <label className={labelClasses}>
          End time
          <input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClasses} />
        </label>
        <fieldset className="col-span-2">
          <legend className="mb-1 text-xs font-semibold text-[var(--color-text-gray)]">Days</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((label, day) => (
              <label key={label} className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--glass-border)] px-2.5 py-1.5 text-xs text-white">
                <input
                  type="checkbox"
                  checked={weekdays.includes(day)}
                  onChange={(e) => setWeekdays((prev) => (e.target.checked ? [...prev, day].sort() : prev.filter((d) => d !== day)))}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {error && <p className="text-sm text-[var(--color-error-red)]">{error}</p>}
      {result && (
        <div className="text-sm">
          <p className="text-[var(--color-brand-green)]">
            Added {result.created.length} {result.created.length === 1 ? "day" : "days"}.
          </p>
          {result.skipped.length > 0 && (
            <ul className="mt-1 text-xs text-[var(--color-text-gray)]">
              {result.skipped.map((s) => (
                <li key={s.date}>
                  {formatDateKey(s.date)} - {s.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button type="submit" disabled={busy || weekdays.length === 0} className={primaryButton}>
        {busy ? "Adding…" : "Add slot"}
      </button>
    </form>
  )
}
