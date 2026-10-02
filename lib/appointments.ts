// Appointment helpers shared by the booking form, the status page, and the
// admin dashboard. Times are always shown in Nepal time, whatever the
// visitor's own device is set to.

import type { AppointmentStatus } from "./appointment-types"

export const APPOINTMENT_TIME_ZONE = "Asia/Kathmandu"

const NEPAL_MOBILE = /^9[678]\d{8}$/
const NEPAL_LANDLINE = /^[1-8]\d{7}$/
const INTERNATIONAL = /^\+[1-9]\d{7,14}$/

/**
 * E.164 form of a phone number, or null if it isn't valid. Mirrors
 * backend/services/phone.js (same test vectors) so the form can say "that
 * number doesn't look right" before submitting - the backend still decides.
 */
export function normalizePhone(input: string): string | null {
  if (typeof input !== "string" || input.length > 30) return null
  let value = input.trim().replace(/[\s\-().]/g, "")
  if (value.startsWith("00")) value = `+${value.slice(2)}`

  let national: string
  if (value.startsWith("+977")) national = value.slice(4)
  else if (value.startsWith("977") && value.length > 10) national = value.slice(3)
  else if (value.startsWith("+")) return INTERNATIONAL.test(value) ? value : null
  else national = value

  if (national.startsWith("0")) national = national.slice(1)
  return NEPAL_MOBILE.test(national) || NEPAL_LANDLINE.test(national) ? `+977${national}` : null
}

function formatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: APPOINTMENT_TIME_ZONE, ...options })
}

const TIME = formatter({ hour: "numeric", minute: "2-digit", hour12: true })
const LONG_DATE = formatter({ weekday: "long", day: "numeric", month: "long", year: "numeric" })
const SHORT_WEEKDAY = formatter({ weekday: "short" })
const DAY_MONTH = formatter({ day: "numeric", month: "short" })

/** "10:30 am" in Kathmandu time. */
export function formatTime(iso: string): string {
  return TIME.format(new Date(iso)).replace(/\s?(am|pm)$/i, (m) => ` ${m.trim().toLowerCase()}`)
}

/**
 * "10:30 – 11:00 am" when both ends share am/pm (short enough for a time
 * button on a phone), "11:30 am – 12:00 pm" when they don't.
 */
export function formatTimeRange(startIso: string, endIso: string): string {
  const start = formatTime(startIso)
  const end = formatTime(endIso)
  const [startTime, startPeriod] = start.split(" ")
  const endPeriod = end.split(" ")[1]
  return startPeriod === endPeriod ? `${startTime} – ${end}` : `${start} – ${end}`
}

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const HOUR = formatter({ hour: "numeric", hour12: true })
const HOUR_MINUTE = formatter({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" })

// Minutes past the hour on a Kathmandu clock - not the UTC minutes, as Nepal
// is UTC+05:45.
function kathmanduMinutes(ms: number): number {
  return Number(HOUR_MINUTE.formatToParts(new Date(ms)).find((p) => p.type === "minute")?.value ?? 0)
}

/**
 * The whole Kathmandu hours around a run of times, as epoch ms - 10:00 to
 * 12:00 for times from 10:00 to 11:30 - for drawing a day's timeline.
 */
export function hourWindow(firstStartIso: string, lastEndIso: string): { start: number; end: number } {
  const first = Date.parse(firstStartIso)
  const last = Date.parse(lastEndIso)
  const start = first - kathmanduMinutes(first) * MINUTE_MS - (first % MINUTE_MS)
  const lastHour = last - kathmanduMinutes(last) * MINUTE_MS - (last % MINUTE_MS)
  return { start, end: lastHour === last ? last : lastHour + HOUR_MS }
}

/** "9 am", "12 pm" - an hour mark on the timeline, in Kathmandu time. */
export function formatHour(ms: number): string {
  return HOUR.format(new Date(ms)).replace(/\s?(am|pm)$/i, (m) => ` ${m.trim().toLowerCase()}`)
}

/** A mark on the timeline: "4 pm" on the hour, "4:30" in between. */
export function formatMark(ms: number): string {
  return kathmanduMinutes(ms) === 0 ? formatHour(ms) : formatTime(new Date(ms).toISOString()).replace(/ (am|pm)$/, "")
}

/** "Wednesday 14 October 2026" for an instant, in Kathmandu time. */
export function formatLongDate(iso: string): string {
  return LONG_DATE.format(new Date(iso)).replace(",", "")
}

// A Kathmandu calendar date ("2026-10-14") formatted on its own: noon UTC on
// that date is the same calendar day in Kathmandu (+05:45), so it's a safe
// instant to format.
const atNoon = (date: string) => new Date(`${date}T12:00:00Z`)

/** { weekday: "Wed", dayMonth: "14 Oct" } for a YYYY-MM-DD Kathmandu date. */
export function dateChipParts(date: string): { weekday: string; dayMonth: string } {
  return { weekday: SHORT_WEEKDAY.format(atNoon(date)), dayMonth: DAY_MONTH.format(atNoon(date)) }
}

/** "Wednesday 14 October 2026" for a YYYY-MM-DD Kathmandu date. */
export function formatDateKey(date: string): string {
  return LONG_DATE.format(atNoon(date)).replace(",", "")
}

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
}

/** What each status means for the customer - honest about what's not confirmed yet. */
export const STATUS_EXPLANATION: Record<AppointmentStatus, string> = {
  requested:
    "Your time is reserved and waiting for the GTS team to confirm it. It isn't confirmed yet - check back here, or message us on WhatsApp with your reference.",
  confirmed: "The GTS team has confirmed your visit. See you then!",
  cancelled: "This visit was cancelled. You're welcome to book another time.",
  completed: "This visit has taken place. Thanks for coming in!",
}

const DATE_KEY = formatter({ year: "numeric", month: "2-digit", day: "2-digit" })

/** Today's date in Kathmandu as YYYY-MM-DD. */
export function kathmanduToday(now = new Date()): string {
  const parts = Object.fromEntries(DATE_KEY.formatToParts(now).map((p) => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

/** "2026-10-31" + 1 -> "2026-11-01" (plain calendar arithmetic on a date key). */
export function addDaysToDateKey(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + days))
  return next.toISOString().slice(0, 10)
}

/** A random key identifying one booking attempt, so a double-submit isn't booked twice. */
export function newRequestKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}
