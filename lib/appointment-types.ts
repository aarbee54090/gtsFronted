export type AppointmentStatus = "requested" | "confirmed" | "cancelled" | "completed"

/** Per-date counts for the date picker (GET /appointments/availability). */
export interface AvailabilitySummaryDay {
  date: string // YYYY-MM-DD in Asia/Kathmandu
  /** Arrival times that can still be picked that day. */
  available: number
}

export interface AvailabilitySummary {
  /** First and last dates customers can pick (the booking window), Kathmandu dates. */
  firstDate: string
  lastDate: string
  /** Only dates with visiting hours; every other date in the window simply has none. */
  days: AvailabilitySummaryDay[]
}

export type VisitTimeStatus = "available" | "unavailable"

/**
 * An arrival time customers can pick (every 15 minutes inside the day's
 * hours). Times are never "taken" - any number of customers can book one -
 * so "unavailable" only means too soon to book online.
 */
export interface VisitTime {
  startsAt: string // ISO, UTC
  status: VisitTimeStatus
}

/** One date (GET /appointments/availability/:date). Never who booked it. */
export interface DayAvailability {
  date: string
  /** False for dates outside the booking window - reason says which side. */
  bookable: boolean
  reason?: "past" | "too_far"
  /** That day's visiting hours, or null when there are none. */
  hours: { slotId: string; startsAt: string; endsAt: string } | null
  times: VisitTime[]
}

/** What the public booking and status endpoints return - never contact details. */
export interface PublicAppointment {
  reference: string
  status: AppointmentStatus
  startsAt: string
  endsAt: string
}

export interface AppointmentHistoryEntry {
  action: string
  at: string
  detail?: string
}

/** Full record, admin only. */
export interface AdminAppointment extends PublicAppointment {
  _id: string
  slot: string
  name: string
  phone: string
  reason?: string
  adminNote?: string
  holdsSlot: boolean
  history: AppointmentHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export interface AdminAppointmentList {
  data: AdminAppointment[]
  count: number
  page: number
  limit: number
  counts: Record<AppointmentStatus, number>
}

/**
 * A day's visiting hours as the admin API returns them - one slot per day.
 * Customers pick an arrival time every `stepMinutes` inside them, and any
 * number of customers can book the same time.
 */
export interface AdminSlot {
  _id: string
  date: string // Kathmandu
  startsAt: string
  endsAt: string
  startTime: string // HH:MM, Kathmandu
  endTime: string
  isActive: boolean
  /** Bookings currently holding the day (not cancelled). */
  bookings: number
  stepMinutes: number
  note?: string
}

export interface BulkSlotResult {
  created: AdminSlot[]
  skipped: { date: string; reason: string }[]
}
