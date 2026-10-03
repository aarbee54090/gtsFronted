"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { AvailabilitySummaryDay } from "@/lib/appointment-types"
import { addDaysToDateKey, formatDateKey } from "@/lib/appointments"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
const MONTH_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-white transition-colors hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"

// Calendar arithmetic on YYYY-MM-DD keys. A calendar date's weekday doesn't
// depend on any time zone, so noon UTC is a safe instant to ask about it.
const atNoon = (date: string) => new Date(`${date}T12:00:00Z`)
const monthOf = (date: string) => date.slice(0, 7)
const firstOfMonth = (month: string) => `${month}-01`

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function daysOfMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number)
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)
}

interface VisitCalendarProps {
  /** The booking window: the only dates that can be picked. */
  firstDate: string
  lastDate: string
  /** How many times can be picked on each date with visiting hours. */
  days: AvailabilitySummaryDay[]
  selected: string | null
  onSelect: (date: string) => void
}

/**
 * Month calendar for choosing a visit date. Every date in the booking
 * window can be picked; dates with times to pick are marked, the rest are
 * muted, and dates outside the window are disabled.
 * Keyboard: arrow keys move by a day or a week (across months), Enter or
 * Space picks.
 */
export function VisitCalendar({ firstDate, lastDate, days, selected, onSelect }: VisitCalendarProps) {
  const counts = new Map(days.map((day) => [day.date, day]))
  const [month, setMonth] = useState(monthOf(selected ?? firstDate))
  // A date picked from outside the calendar (e.g. "next available") brings
  // its month into view - adjusted during render, React's pattern for
  // state that follows a prop.
  const [shownSelected, setShownSelected] = useState(selected)
  if (selected !== shownSelected) {
    setShownSelected(selected)
    if (selected) setMonth(monthOf(selected))
  }
  // The day that holds keyboard focus within the grid (roving tabindex).
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  const inWindow = (date: string) => date >= firstDate && date <= lastDate
  const monthDays = daysOfMonth(month)
  const leadingBlanks = atNoon(firstOfMonth(month)).getUTCDay()
  const canGoBack = month > monthOf(firstDate)
  const canGoForward = month < monthOf(lastDate)

  // Which day is in the tab order: the focused one, else the selected one if
  // it's on screen, else the first pickable day of the month.
  const tabbable =
    (focusDate && monthOf(focusDate) === month && focusDate) ||
    (selected && monthOf(selected) === month && selected) ||
    monthDays.find(inWindow) ||
    null

  function moveFocus(from: string, by: number) {
    let next = addDaysToDateKey(from, by)
    if (next < firstDate) next = firstDate
    if (next > lastDate) next = lastDate
    setFocusDate(next)
    setMonth(monthOf(next))
    // Focus once React has rendered the (possibly new) month.
    setTimeout(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus(), 0)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, date: string) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    moveFocus(date, step)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className={MONTH_BUTTON}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p aria-live="polite" className="text-base font-bold text-white">
          {MONTH.format(atNoon(firstOfMonth(month)))}
        </p>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className={MONTH_BUTTON}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div ref={grid} role="group" aria-label={`Dates in ${MONTH.format(atNoon(firstOfMonth(month)))}`}>
        <div aria-hidden="true" className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[var(--color-text-gray)]">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} aria-hidden="true" />
          ))}
          {monthDays.map((date) => {
            const pickable = inWindow(date)
            const count = counts.get(date)
            const isSelected = date === selected
            const free = count?.available ?? 0
            const label = `${formatDateKey(date)}, ${
              !pickable ? "not bookable" : free > 0 ? `${free} ${free === 1 ? "time" : "times"} available` : "no times"
            }`
            return (
              <button
                key={date}
                type="button"
                data-date={date}
                disabled={!pickable}
                aria-pressed={isSelected}
                aria-label={label}
                tabIndex={date === tabbable ? 0 : -1}
                onClick={() => {
                  setFocusDate(date)
                  onSelect(date)
                }}
                onKeyDown={(e) => onKeyDown(e, date)}
                className={`relative flex h-11 flex-col items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-transparent disabled:text-white/20 ${
                  isSelected
                    ? "bg-[var(--color-brand-green)] text-[var(--color-bg-dark)]"
                    : free > 0
                      ? "bg-white/[0.06] text-white hover:bg-white/[0.12]"
                      : // No times to pick: muted grey, still pickable.
                        "text-white/45 hover:bg-white/[0.05]"
                }`}
              >
                {Number(date.slice(8))}
                {pickable && free > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? "bg-[var(--color-bg-dark)]" : "bg-[var(--color-brand-green)]"}`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-gray)]">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-green)]" /> Open for visits
      </p>
    </div>
  )
}
