"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { VisitTime } from "@/lib/appointment-types"
import { formatMark, formatTime, hourWindow } from "@/lib/appointments"

const MINUTE_MS = 60 * 1000
// Half the handle's width in px: the line is inset this much on each side
// (px-3.5 / mx-3.5) so the handle never pokes out past its ends.
const INSET = 14
// Keys that move the handle, and by how many times.
const STEPS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 4, PageDown: -4 }
const STEP_BUTTON =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-white transition-colors hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"

interface TimeSliderProps {
  /** The day's visiting hours. */
  hours: { startsAt: string; endsAt: string }
  /** Its arrival times, earliest first. */
  times: VisitTime[]
  /** The chosen arrival time (ISO), if any. */
  value: string | null
  onChange: (startsAt: string) => void
}

/**
 * A day's visiting hours as one line, with a handle the customer drags (or
 * taps the line, or uses the arrow keys or the Earlier/Later buttons) to
 * the time they'd like to arrive. The handle snaps to the arrival times -
 * every 15 minutes - and skips any too soon to book online. Times are never
 * taken: any number of customers can pick the same one.
 */
export function TimeSlider({ hours, times, value, onChange }: TimeSliderProps) {
  const dragging = useRef(false)
  const free = times.filter((t) => t.status === "available")
  const index = value ? free.findIndex((t) => t.startsAt === value) : -1

  const { start, end } = hourWindow(hours.startsAt, hours.endsAt)
  const at = (ms: number) => ((ms - start) / (end - start)) * 100
  const ms = (iso: string) => Date.parse(iso)

  // Marks every half hour on a short line, every hour on a longer one; fewer
  // labels when the line is narrow.
  const markStep = (end - start <= 3 * 60 * MINUTE_MS ? 30 : 60) * MINUTE_MS
  const marks: number[] = []
  for (let t = start; t <= end; t += markStep) marks.push(t)
  const intervals = marks.length - 1
  const narrowEvery = intervals <= 6 ? 1 : intervals <= 12 ? 2 : 3
  const wideEvery = intervals <= 12 ? 1 : 2

  function choose(time: VisitTime | undefined) {
    if (time && time.startsAt !== value) onChange(time.startsAt)
  }

  // The free time closest to the pointer.
  function nearest(clientX: number, line: HTMLElement): VisitTime | undefined {
    const box = line.getBoundingClientRect()
    const width = box.width - 2 * INSET
    if (width <= 0 || free.length === 0) return undefined
    const pointer = start + ((clientX - box.left - INSET) / width) * (end - start)
    return free.reduce((best, t) => (Math.abs(ms(t.startsAt) - pointer) < Math.abs(ms(best.startsAt) - pointer) ? t : best))
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const last = free.length - 1
    let next: number | undefined
    if (e.key in STEPS) next = index < 0 ? 0 : Math.min(last, Math.max(0, index + STEPS[e.key]))
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = last
    if (next === undefined || last < 0) return
    e.preventDefault()
    choose(free[next])
  }

  const handleAt = value ? at(ms(value)) : null

  return (
    <div className="@container flex flex-col gap-1">
      {/* The chosen time rides above the handle, kept inside the line's ends. */}
      {free.length > 0 && (
        <div aria-hidden="true" className="relative mx-3.5 h-6">
          {value && handleAt !== null ? (
            <span
              className="absolute top-0 whitespace-nowrap text-[15px] font-bold text-[var(--color-brand-green)]"
              style={{ left: `${handleAt}%`, transform: `translateX(-${handleAt}%)` }}
            >
              {formatTime(value)}
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-gray)]">Drag along the line, or tap it, to choose a time.</span>
          )}
        </div>
      )}

      <div
        role="slider"
        tabIndex={free.length > 0 ? 0 : -1}
        aria-label="Arrival time"
        aria-valuemin={0}
        aria-valuemax={Math.max(free.length - 1, 0)}
        aria-valuenow={Math.max(index, 0)}
        aria-valuetext={value ? formatTime(value) : free.length > 0 ? "No time chosen" : "No free times"}
        aria-disabled={free.length === 0 || undefined}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (free.length === 0) return
          dragging.current = true
          // Keep following the finger or mouse even when it slides off the line.
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            // Pointer capture isn't available everywhere; dragging still works on the line.
          }
          choose(nearest(e.clientX, e.currentTarget))
        }}
        onPointerMove={(e) => {
          if (dragging.current) choose(nearest(e.clientX, e.currentTarget))
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
        className={`relative touch-none select-none px-3.5 py-[18px] ${free.length > 0 ? "cursor-pointer" : "cursor-not-allowed"}`}
      >
        <div className="relative h-2 rounded-full bg-white/[0.08]">
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {/* Each time's stretch, up to the next time (or closing): lime when it can be picked. */}
            {times.map((t, i) => {
              const from = at(ms(t.startsAt))
              const to = at(i + 1 < times.length ? ms(times[i + 1].startsAt) : ms(hours.endsAt))
              return (
                <span
                  key={t.startsAt}
                  data-status={t.status}
                  title={`${formatTime(t.startsAt)} · ${t.status === "available" ? "Available" : "Too soon to book online"}`}
                  className={`absolute inset-y-0 ${t.status === "available" ? "bg-[var(--color-brand-green)]/40" : "bg-white/25"}`}
                  style={{ left: `${from}%`, width: `${to - from}%` }}
                />
              )
            })}
            {marks.slice(1, -1).map((t) => (
              <span key={t} className="absolute inset-y-0 w-px bg-[var(--color-bg-dark)]/60" style={{ left: `${at(t)}%` }} />
            ))}
          </div>
          {handleAt !== null && (
            <span
              className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--color-bg-dark)] bg-[var(--color-brand-green)] shadow-[0_0_0_2px_var(--color-brand-green)] transition-[left] duration-150"
              style={{ left: `${handleAt}%` }}
            />
          )}
        </div>
      </div>

      <div aria-hidden="true" className="relative mx-3.5 h-4">
        {marks.map((t, i) => (
          <span
            key={t}
            className={`absolute top-0 whitespace-nowrap text-xs text-[var(--color-text-gray)] ${
              i % narrowEvery ? "@max-[30rem]:hidden" : ""
            } ${i % wideEvery ? "@min-[30rem]:hidden" : ""}`}
            style={{ left: `${at(t)}%`, transform: `translateX(${i === 0 ? 0 : i === marks.length - 1 ? -100 : -50}%)` }}
          >
            {formatMark(t)}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-gray)]">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-1.5 w-4 rounded-full bg-[var(--color-brand-green)]/40" /> Visiting hours
          </span>
          {times.some((t) => t.status === "unavailable") && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-1.5 w-4 rounded-full bg-white/25" /> Too soon to book online
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-label="Earlier time" disabled={index <= 0} onClick={() => choose(free[index - 1])} className={STEP_BUTTON}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Later time"
            disabled={index >= free.length - 1}
            onClick={() => choose(free[index + 1])}
            className={STEP_BUTTON}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
