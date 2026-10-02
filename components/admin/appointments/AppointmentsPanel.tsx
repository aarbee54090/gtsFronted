"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, RefreshCw } from "lucide-react"
import {
  ApiError,
  adminDeleteAppointment,
  adminListAppointments,
  adminListSlots,
  adminRescheduleAppointment,
  adminSetAppointmentStatus,
  adminUpdateAppointmentNote,
} from "@/lib/api"
import type { AdminAppointment, AdminAppointmentList, AdminSlot, AppointmentStatus } from "@/lib/appointment-types"
import { STATUS_LABEL, addDaysToDateKey, formatDateKey, formatLongDate, formatTime, formatTimeRange, kathmanduToday } from "@/lib/appointments"
import { whatsappLink } from "@/lib/site"

type View = "upcoming" | "past" | "all"

interface Query {
  view: View
  status: AppointmentStatus | ""
  from: string
  to: string
  page: number
}

const STATUSES: AppointmentStatus[] = ["requested", "confirmed", "completed", "cancelled"]

const smallButton =
  "rounded-[var(--radius-pill)] border px-3.5 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
const inputClasses =
  "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"

export function AppointmentsPanel() {
  const [query, setQuery] = useState<Query>({ view: "upcoming", status: "", from: "", to: "", page: 1 })
  const [result, setResult] = useState<AdminAppointmentList | null>(null)
  const [items, setItems] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  // When the list was last loaded - decides which actions apply (e.g. "Mark
  // completed" once a visit has started). Updated with each load, never read
  // from the clock during render.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    adminListAppointments(query)
      .then((res) => {
        if (cancelled) return
        setResult(res)
        setItems((prev) => (query.page === 1 ? res.data : [...prev, ...res.data]))
        setError(null)
        setNow(Date.now())
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load appointments.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query, refreshKey])

  function update(changes: Partial<Query>) {
    setLoading(true)
    setQuery((prev) => ({ ...prev, page: 1, ...changes }))
  }

  function refresh() {
    setLoading(true)
    setQuery((prev) => ({ ...prev, page: 1 }))
    setRefreshKey((k) => k + 1)
  }

  // Keep the status counts on the filter buttons in step with changes made
  // on this page, without reloading the list.
  function adjustCounts(from: AppointmentStatus | null, to: AppointmentStatus | null) {
    if (from === to) return
    setResult((prev) => {
      if (!prev) return prev
      const counts = { ...prev.counts }
      if (from) counts[from] = Math.max(0, counts[from] - 1)
      if (to) counts[to] += 1
      return { ...prev, counts }
    })
  }

  function replace(updated: AdminAppointment) {
    const previous = items.find((a) => a._id === updated._id)
    adjustCounts(previous?.status ?? null, updated.status)
    setItems((prev) => prev.map((a) => (a._id === updated._id ? updated : a)))
  }

  function remove(id: string) {
    const previous = items.find((a) => a._id === id)
    adjustCounts(previous?.status ?? null, null)
    setItems((prev) => prev.filter((a) => a._id !== id))
  }

  const counts = result?.counts

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["upcoming", "past", "all"] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={query.view === view}
              onClick={() => update({ view })}
              className={`${smallButton} ${
                query.view === view
                  ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-[var(--color-bg-dark)]"
                  : "border-[var(--glass-border)] text-white hover:border-[var(--color-brand-green)]"
              }`}
            >
              {view === "upcoming" ? "Upcoming" : view === "past" ? "Past" : "All"}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-[var(--glass-border)]" aria-hidden="true" />
          <button
            type="button"
            aria-pressed={query.status === ""}
            onClick={() => update({ status: "" })}
            className={`${smallButton} ${query.status === "" ? "border-white text-white" : "border-[var(--glass-border)] text-[var(--color-text-gray)] hover:text-white"}`}
          >
            Any status
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={query.status === status}
              onClick={() => update({ status })}
              className={`${smallButton} ${query.status === status ? "border-white text-white" : "border-[var(--glass-border)] text-[var(--color-text-gray)] hover:text-white"}`}
            >
              {STATUS_LABEL[status]}
              {counts ? ` (${counts[status]})` : ""}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-gray)]">
            From
            <input type="date" value={query.from} onChange={(e) => update({ from: e.target.value })} className={inputClasses} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-gray)]">
            To
            <input type="date" value={query.to} onChange={(e) => update({ to: e.target.value })} className={inputClasses} />
          </label>
          {(query.from || query.to) && (
            <button type="button" onClick={() => update({ from: "", to: "" })} className="pb-2 text-xs font-semibold text-[var(--color-text-gray)] hover:text-white">
              Clear dates
            </button>
          )}
          <button
            type="button"
            onClick={refresh}
            className={`${smallButton} ml-auto flex items-center gap-1.5 border-[var(--glass-border)] text-white hover:border-[var(--color-brand-green)]`}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>

      {error && <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">{error}</p>}

      {loading && items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-gray)]">Loading appointments…</p>
      ) : items.length === 0 && !error ? (
        <p className="text-sm text-[var(--color-text-gray)]">
          No {query.status ? STATUS_LABEL[query.status].toLowerCase() : ""} appointments
          {query.view === "upcoming" ? " coming up" : query.view === "past" ? " in the past" : ""}.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((appointment) => (
            <AppointmentCard key={appointment._id} appointment={appointment} now={now} onChange={replace} onDelete={remove} />
          ))}
        </div>
      )}

      {result && items.length < result.count && (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true)
            setQuery((prev) => ({ ...prev, page: prev.page + 1 }))
          }}
          className={`${smallButton} w-fit border-[var(--glass-border)] text-white hover:border-[var(--color-brand-green)]`}
        >
          {loading ? "Loading…" : `Load more (${result.count - items.length} more)`}
        </button>
      )}
    </div>
  )
}

function statusBadgeClass(status: AppointmentStatus): string {
  return {
    requested: "border-amber-400/50 bg-amber-400/10 text-amber-300",
    confirmed: "border-[var(--color-brand-green)]/50 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]",
    completed: "border-sky-400/50 bg-sky-400/10 text-sky-300",
    cancelled: "border-[var(--glass-border)] text-[var(--color-text-gray)]",
  }[status]
}

function AppointmentCard({
  appointment,
  now,
  onChange,
  onDelete,
}: {
  appointment: AdminAppointment
  now: number
  onChange: (a: AdminAppointment) => void
  onDelete: (id: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState<string | null>(null)
  // Rescheduling: the open days to choose from, then the chosen day and arrival time.
  const [rescheduleDays, setRescheduleDays] = useState<AdminSlot[] | null>(null)
  const [moveDay, setMoveDay] = useState("")
  const [moveTimes, setMoveTimes] = useState<string[]>([])
  const [moveTime, setMoveTime] = useState("")

  const active = appointment.status === "requested" || appointment.status === "confirmed"
  const started = new Date(appointment.startsAt).getTime() <= now
  const finished = appointment.status === "cancelled" || appointment.status === "completed"

  async function run(action: () => Promise<AdminAppointment | void>, onDone?: (result: AdminAppointment | void) => void) {
    setBusy(true)
    setError(null)
    try {
      const result = await action()
      onDone?.(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  function cancel() {
    const note = window.prompt(
      "Cancel this appointment? Optionally add a short reason (kept in the history). The customer isn't notified automatically.",
      ""
    )
    if (note === null) return
    run(() => adminSetAppointmentStatus(appointment._id, "cancelled", note || undefined), (a) => a && onChange(a))
  }

  async function openReschedule() {
    setError(null)
    const today = kathmanduToday()
    try {
      const days = await adminListSlots(today, addDaysToDateKey(today, 90))
      setRescheduleDays(days.filter((d) => d.isActive && new Date(d.endsAt).getTime() > Date.now()))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load slots.")
    }
  }

  // A day's arrival times still ahead, other than where the booking already is.
  function pickMoveDay(id: string) {
    setMoveDay(id)
    setMoveTime("")
    const day = rescheduleDays?.find((d) => d._id === id)
    const times: string[] = []
    if (day) {
      const step = day.stepMinutes * 60 * 1000
      for (let t = new Date(day.startsAt).getTime(); t < new Date(day.endsAt).getTime(); t += step) {
        const iso = new Date(t).toISOString()
        if (t > Date.now() && iso !== new Date(appointment.startsAt).toISOString()) times.push(iso)
      }
    }
    setMoveTimes(times)
  }

  function closeReschedule() {
    setRescheduleDays(null)
    setMoveDay("")
    setMoveTimes([])
    setMoveTime("")
  }

  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">
            {formatLongDate(appointment.startsAt)} · {formatTime(appointment.startsAt)}
          </p>
          <p className="font-mono text-xs text-[var(--color-text-gray)]">{appointment.reference}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusBadgeClass(appointment.status)}`}>
          {STATUS_LABEL[appointment.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-[var(--color-text-gray)]">Name</p>
          <p className="font-semibold text-white">{appointment.name}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-gray)]">Contact number</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`tel:${appointment.phone}`} className="flex items-center gap-1.5 font-semibold text-white hover:text-[var(--color-brand-green)]">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {appointment.phone}
            </a>
            <a
              href={whatsappLink(
                appointment.phone,
                `Hi ${appointment.name}, this is GoalThali Sports about your visit request ${appointment.reference} on ${formatLongDate(appointment.startsAt)} at ${formatTime(appointment.startsAt)}.`
              )}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-[#25D366] hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>
        {appointment.reason && (
          <div className="sm:col-span-2">
            <p className="text-xs text-[var(--color-text-gray)]">Reason for visit</p>
            <p className="whitespace-pre-line text-white">{appointment.reason}</p>
          </div>
        )}
      </div>

      {noteDraft === null ? (
        <div className="text-sm">
          <p className="text-xs text-[var(--color-text-gray)]">Admin note</p>
          <p className="whitespace-pre-line text-white/90">{appointment.adminNote || <span className="text-[var(--color-text-gray)]">—</span>}</p>
          <button type="button" onClick={() => setNoteDraft(appointment.adminNote ?? "")} className="mt-1 text-xs font-semibold text-[var(--color-brand-green)] hover:underline">
            {appointment.adminNote ? "Edit note" : "Add note"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor={`note-${appointment._id}`} className="text-xs font-semibold text-[var(--color-text-gray)]">
            Admin note (only visible here)
          </label>
          <textarea
            id={`note-${appointment._id}`}
            value={noteDraft}
            maxLength={1000}
            rows={3}
            onChange={(e) => setNoteDraft(e.target.value)}
            className={inputClasses}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() => adminUpdateAppointmentNote(appointment._id, noteDraft), (a) => {
                  if (a) onChange(a)
                  setNoteDraft(null)
                })
              }
              className={`${smallButton} border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-[var(--color-bg-dark)]`}
            >
              Save note
            </button>
            <button type="button" onClick={() => setNoteDraft(null)} className={`${smallButton} border-[var(--glass-border)] text-white`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {rescheduleDays !== null && (
        <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-3">
          <p className="text-xs font-semibold text-[var(--color-text-gray)]">Move to another day or time</p>
          {rescheduleDays.length === 0 ? (
            <p className="text-sm text-[var(--color-text-gray)]">No open days coming up. Add a slot first.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-gray)]">
                Day
                <select value={moveDay} onChange={(e) => pickMoveDay(e.target.value)} className={inputClasses}>
                  <option value="">Choose a day…</option>
                  {rescheduleDays.map((day) => (
                    <option key={day._id} value={day._id}>
                      {formatDateKey(day.date)} · {formatTimeRange(day.startsAt, day.endsAt)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-gray)]">
                Time
                <select value={moveTime} disabled={!moveDay} onChange={(e) => setMoveTime(e.target.value)} className={inputClasses}>
                  <option value="">{moveDay && moveTimes.length === 0 ? "No times left that day" : "Choose a time…"}</option>
                  {moveTimes.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || !moveDay || !moveTime}
              onClick={() =>
                run(() => adminRescheduleAppointment(appointment._id, moveDay, moveTime), (a) => {
                  if (a) onChange(a)
                  closeReschedule()
                })
              }
              className={`${smallButton} border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-[var(--color-bg-dark)]`}
            >
              Move appointment
            </button>
            <button type="button" onClick={closeReschedule} className={`${smallButton} border-[var(--glass-border)] text-white`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[var(--color-error-red)]">{error}</p>}

      <div className="flex flex-wrap gap-2 border-t border-[var(--glass-border)] pt-4">
        {appointment.status === "requested" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => adminSetAppointmentStatus(appointment._id, "confirmed"), (a) => a && onChange(a))}
            className={`${smallButton} border-[var(--color-brand-green)] bg-[var(--color-brand-green)] text-[var(--color-bg-dark)]`}
          >
            Confirm
          </button>
        )}
        {active && (
          <button type="button" disabled={busy} onClick={openReschedule} className={`${smallButton} border-[var(--glass-border)] text-white hover:border-[var(--color-brand-green)]`}>
            Reschedule
          </button>
        )}
        {active && (
          <button
            type="button"
            disabled={busy || !started}
            title={started ? undefined : "Available once the appointment time has started"}
            onClick={() => run(() => adminSetAppointmentStatus(appointment._id, "completed"), (a) => a && onChange(a))}
            className={`${smallButton} border-[var(--glass-border)] text-white hover:border-sky-400`}
          >
            Mark completed
          </button>
        )}
        {active && (
          <button type="button" disabled={busy} onClick={cancel} className={`${smallButton} border-[var(--color-error-red)]/50 text-[var(--color-error-red)] hover:border-[var(--color-error-red)]`}>
            Cancel appointment
          </button>
        )}
        {finished && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!window.confirm("Delete this appointment and the customer's details permanently? This can't be undone.")) return
              run(() => adminDeleteAppointment(appointment._id), () => onDelete(appointment._id))
            }}
            className={`${smallButton} border-[var(--glass-border)] text-[var(--color-text-gray)] hover:border-[var(--color-error-red)] hover:text-[var(--color-error-red)]`}
          >
            Delete
          </button>
        )}
      </div>

      {appointment.history?.length > 0 && (
        <details className="text-xs text-[var(--color-text-gray)]">
          <summary className="cursor-pointer select-none font-semibold hover:text-white">History</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {appointment.history.map((entry, i) => (
              <li key={i}>
                {new Date(entry.at).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu", dateStyle: "medium", timeStyle: "short" })}{" "}
                - {entry.action}
                {entry.detail ? `: ${entry.detail}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}
