"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CalendarDays, CheckCircle2, MessageCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimeSlider } from "@/components/contact/TimeSlider"
import { VisitCalendar } from "@/components/contact/VisitCalendar"
import { ApiError, getAppointmentAvailability, getAppointmentDay, requestAppointment } from "@/lib/api"
import type { AvailabilitySummary, DayAvailability, PublicAppointment } from "@/lib/appointment-types"
import {
  STATUS_EXPLANATION,
  STATUS_LABEL,
  dateChipParts,
  formatDateKey,
  formatLongDate,
  formatTime,
  newRequestKey,
  normalizePhone,
} from "@/lib/appointments"
import { whatsappLink } from "@/lib/site"

type Load<T> = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: T }

interface FieldErrors {
  time?: string
  name?: string
  phone?: string
  reason?: string
}

const REASON_LIMIT = 500

// The calendar beside the times from tablet width up, stacked on phones: the
// calendar keeps a compact fixed width and the times take the rest.
const COLUMNS = "md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]"

const message = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback)

function validate(time: string | null, name: string, phone: string, reason: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!time) errors.time = "Choose a time for your visit."
  if (name.trim().length < 2) errors.name = "Please enter your full name."
  else if (name.trim().length > 100) errors.name = "Please keep your name under 100 characters."
  if (!phone.trim()) errors.phone = "Please enter a contact number."
  else if (!normalizePhone(phone)) errors.phone = "Enter a valid number, e.g. 98XXXXXXXX or +977 98XXXXXXXX."
  if (reason.length > REASON_LIMIT) errors.reason = `Please keep this under ${REASON_LIMIT} characters.`
  return errors
}

/**
 * Book a visit: pick a date on the calendar, slide to an arrival time on that
 * day's visiting hours, add name and number, and book. Every date in the
 * booking window can be picked; the day's hours come from the server each
 * time the date changes, and a new date starts on its first free time. Any
 * number of customers can book the same time. The server checks the time
 * again when booking - if the day was closed or changed meanwhile, it
 * refreshes and the customer picks again, keeping what they typed.
 */
export function BookVisit({ whatsapp }: { whatsapp?: string | null }) {
  const [summary, setSummary] = useState<Load<AvailabilitySummary>>({ state: "loading" })
  const [date, setDate] = useState<string | null>(null)
  const [day, setDay] = useState<Load<DayAvailability> | null>(null)
  // The chosen arrival time (ISO).
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [reason, setReason] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  // A day closed or changed meanwhile - shown next to the times.
  const [notice, setNotice] = useState<string | null>(null)
  // Any other failure to book - shown next to the Book button.
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [booking, setBooking] = useState<PublicAppointment | null>(null)
  // One key per booking attempt: a repeated or retried submit of the same
  // details gets the same booking back instead of a second one.
  const requestKey = useRef<string | null>(null)
  // Only the latest date's times are shown, even if an older request finishes last.
  const dayRequest = useRef(0)
  const timesHeading = useRef<HTMLSpanElement>(null)
  const doneHeading = useRef<HTMLHeadingElement>(null)

  // `pickFirst`: a newly chosen date starts on its first free time, ready to
  // adjust. Not after a booking conflict - then the customer picks again.
  const loadDay = useCallback((value: string, { pickFirst = false } = {}) => {
    const id = ++dayRequest.current
    setDay({ state: "loading" })
    getAppointmentDay(value)
      .then((data) => {
        if (id !== dayRequest.current) return
        setDay({ state: "ready", data })
        if (pickFirst) setTime(data.times.find((t) => t.status === "available")?.startsAt ?? null)
      })
      .catch((err: unknown) => id === dayRequest.current && setDay({ state: "error", message: message(err, "We couldn't load the times for this date.") }))
  }, [])

  // State is only set once the request settles, so this is safe to start
  // from the mount effect. The first date shown is the first one with a
  // free time, or today.
  const fetchSummary = useCallback(
    (keepDate: string | null) => {
      getAppointmentAvailability()
        .then((data) => {
          setSummary({ state: "ready", data })
          const start =
            keepDate ?? data.days.find((d) => d.available > 0)?.date ?? data.firstDate
          setDate(start)
          loadDay(start, { pickFirst: keepDate === null })
        })
        .catch((err: unknown) =>
          setSummary({ state: "error", message: message(err, "We couldn't load the booking calendar.") })
        )
    },
    [loadDay]
  )

  useEffect(() => {
    fetchSummary(null)
  }, [fetchSummary])

  // After a booking conflict: fresh counts for the calendar, same date.
  function refreshSummary() {
    getAppointmentAvailability()
      .then((data) => setSummary({ state: "ready", data }))
      .catch(() => {
        // Keep the counts already shown; the day's times were refreshed separately.
      })
  }

  useEffect(() => {
    if (booking) doneHeading.current?.focus()
  }, [booking])

  function chooseDate(value: string) {
    // Tapping the date that's already shown keeps the chosen time.
    if (value === date) return
    setDate(value)
    setTime(null)
    setNotice(null)
    setErrors((prev) => ({ ...prev, time: undefined }))
    requestKey.current = null
    loadDay(value, { pickFirst: true })
  }

  function chooseTime(value: string) {
    setTime(value)
    setNotice(null)
    setErrors((prev) => ({ ...prev, time: undefined }))
    requestKey.current = null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    const hours = day?.state === "ready" ? day.data.hours : null
    const found = validate(time && hours ? time : null, name, phone, reason)
    setErrors(found)
    if (Object.keys(found).length > 0 || !time || !hours) {
      if (found.time) timesHeading.current?.scrollIntoView?.({ behavior: "smooth", block: "center" })
      return
    }

    setSubmitting(true)
    setNotice(null)
    setSubmitError(null)
    requestKey.current ??= newRequestKey()
    try {
      setBooking(
        await requestAppointment({
          slotId: hours.slotId,
          startsAt: time,
          name: name.trim(),
          phone: phone.trim(),
          reason: reason.trim() || undefined,
          requestKey: requestKey.current,
        })
      )
    } catch (err) {
      if (err instanceof ApiError && err.code === "slot_unavailable") {
        // The day was closed or changed since it was shown: refresh it and
        // the calendar, and let them choose again - their details are kept.
        setNotice(err.message)
        setTime(null)
        requestKey.current = null
        if (date) loadDay(date)
        refreshSummary()
        timesHeading.current?.scrollIntoView?.({ behavior: "smooth", block: "center" })
      } else {
        setSubmitError(message(err, "We couldn't book your appointment. Check your connection and try again."))
      }
    } finally {
      setSubmitting(false)
    }
  }

  function startOver() {
    setBooking(null)
    setTime(null)
    setReason("")
    requestKey.current = null
    setSummary({ state: "loading" })
    fetchSummary(null)
  }

  // ------------------------------------------------------------ confirmation
  if (booking) {
    return (
      <div className="flex flex-col gap-5" aria-live="polite">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
          <h3 ref={doneHeading} tabIndex={-1} className="text-xl font-bold not-italic text-white outline-none">
            Booking received
          </h3>
        </div>
        <div className="surface-card flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-gray)]">Booking reference</p>
              <p className="font-mono text-2xl font-bold tracking-wider text-white">{booking.reference}</p>
            </div>
            <span className={`badge badge-${booking.status}`}>{STATUS_LABEL[booking.status]}</span>
          </div>
          <p className="flex items-start gap-2 text-sm text-white">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
            <span>
              {formatLongDate(booking.startsAt)}, {formatTime(booking.startsAt)}{" "}
              <span className="text-[var(--color-text-gray)]">(Nepal time)</span>
            </span>
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-text-gray)]">{STATUS_EXPLANATION[booking.status]}</p>
          <p className="text-sm text-[var(--color-text-gray)]">
            Keep your reference - you&apos;ll need it to check or change your visit. We don&apos;t send SMS or email
            updates yet.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={`/appointments/${booking.reference}`}>Check status</Link>
          </Button>
          <Button asChild variant="secondary">
            <a
              href={whatsappLink(
                whatsapp,
                `Hi GoalThali Sports, I booked a visit (${booking.reference}) on ${formatLongDate(booking.startsAt)} at ${formatTime(booking.startsAt)}.`
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Message us about it
            </a>
          </Button>
          <Button variant="ghost" onClick={startOver}>
            Book another visit
          </Button>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------- calendar
  if (summary.state === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading the booking calendar" className={`grid gap-8 lg:gap-10 ${COLUMNS}`}>
        <div className="skeleton h-80" />
        <div className="flex flex-col gap-3">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
        </div>
      </div>
    )
  }

  if (summary.state === "error") {
    return (
      <div className="notice notice-error flex flex-col items-start gap-3">
        <p>{summary.message}</p>
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={() => {
            setSummary({ state: "loading" })
            fetchSummary(date)
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </Button>
      </div>
    )
  }

  const { firstDate, lastDate, days } = summary.data
  const nothingBookable = days.every((d) => d.available === 0)
  const nextAvailable = date ? days.find((d) => d.date > date && d.available > 0)?.date : undefined
  const hours = day?.state === "ready" ? day.data.hours : null
  const dayTimes = day?.state === "ready" ? day.data.times : []
  const freeCount = dayTimes.filter((t) => t.status === "available").length

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      {nothingBookable && (
        <div className="notice flex flex-col items-start gap-3">
          <p>No visit times are open for online booking right now. Message us and we&apos;ll arrange a time with you.</p>
          <Button asChild size="sm" variant="whatsapp">
            <a href={whatsappLink(whatsapp, "Hi GoalThali Sports, I'd like to arrange a visit.")} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Arrange on WhatsApp
            </a>
          </Button>
        </div>
      )}

      <div className={`grid gap-8 lg:gap-10 ${COLUMNS}`}>
        <fieldset className="min-w-0">
          <legend className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <StepNumber n={1} /> Choose a date
          </legend>
          <VisitCalendar firstDate={firstDate} lastDate={lastDate} days={days} selected={date} onSelect={chooseDate} />
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <StepNumber n={2} />
            <span ref={timesHeading}>Choose a time</span>
          </legend>
          {date && (
            <p className="mb-4 text-sm text-[var(--color-text-gray)]">
              <span className="font-semibold text-white">{formatDateKey(date)}</span> · Nepal time
            </p>
          )}

          {notice && (
            <p role="alert" className="notice notice-warning mb-3">
              {notice}
            </p>
          )}

          {/* Loading, errors, and "no free times" are announced; the slider
              speaks for itself as it moves. */}
          <div aria-live="polite">
            {day?.state === "loading" && <div aria-label="Loading times" className="skeleton h-32" />}

            {day?.state === "error" && (
              <div className="notice notice-error flex flex-col items-start gap-3">
                <p>{day.message}</p>
                {date && (
                  <Button size="sm" variant="secondary" type="button" onClick={() => loadDay(date, { pickFirst: true })}>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
                  </Button>
                )}
              </div>
            )}

            {day?.state === "ready" && freeCount === 0 && (
              <div className="notice flex flex-col items-start gap-3">
                <p>
                  {hours ? "There are no free times left on this date." : "There are no visiting hours on this date."}{" "}
                  Please choose another date.
                </p>
                {nextAvailable && (
                  // Short date ("Thu 5 Nov") so the button fits a phone screen.
                  <Button size="sm" variant="secondary" type="button" onClick={() => chooseDate(nextAvailable)}>
                    Next available: {dateChipParts(nextAvailable).weekday} {dateChipParts(nextAvailable).dayMonth}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Even a day whose times have all gone shows its hours. */}
          {day?.state === "ready" && hours && (
            <div className={freeCount === 0 ? "mt-4" : ""}>
              <TimeSlider hours={hours} times={dayTimes} value={time} onChange={chooseTime} />
            </div>
          )}
          {errors.time && (
            <p role="alert" className="field-error mt-2">
              {errors.time}
            </p>
          )}
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 flex items-center gap-2 text-base font-bold text-white">
          <StepNumber n={3} /> Your details
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="field">
            <label htmlFor="visit-name" className="field-label">
              Full name <span aria-hidden="true" className="text-[var(--color-brand-green)]">*</span>
            </label>
            <input
              id="visit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                requestKey.current = null
              }}
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "visit-name-error" : undefined}
              className="field-input"
            />
            {errors.name && (
              <p id="visit-name-error" className="field-error">
                {errors.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="visit-phone" className="field-label">
              Contact number <span aria-hidden="true" className="text-[var(--color-brand-green)]">*</span>
            </label>
            <input
              id="visit-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                requestKey.current = null
              }}
              autoComplete="tel"
              placeholder="98XXXXXXXX"
              required
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "visit-phone-error" : "visit-phone-hint"}
              className="field-input"
            />
            {errors.phone ? (
              <p id="visit-phone-error" className="field-error">
                {errors.phone}
              </p>
            ) : (
              <p id="visit-phone-hint" className="field-hint">
                So we can confirm or rearrange your visit. Only the GTS team sees it.
              </p>
            )}
          </div>
        </div>
        <div className="field">
          <label htmlFor="visit-reason" className="field-label">
            Reason for visit <span className="font-normal text-[var(--color-text-gray)]">(optional)</span>
          </label>
          <textarea
            id="visit-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              requestKey.current = null
            }}
            rows={3}
            maxLength={REASON_LIMIT}
            placeholder="e.g. Discuss a football kit for 20 players, check fabric options"
            aria-invalid={Boolean(errors.reason)}
            aria-describedby="visit-reason-count"
            className="field-input"
          />
          <p id="visit-reason-count" className={errors.reason ? "field-error" : "field-hint"}>
            {errors.reason ?? `${reason.length}/${REASON_LIMIT}`}
          </p>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line-strong)] bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3" aria-live="polite">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
          {time ? (
            <p className="text-sm text-white">
              <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-gray)]">
                Your appointment
              </span>
              <span className="font-semibold">
                {formatLongDate(time)}, {formatTime(time)}
              </span>{" "}
              <span className="text-[var(--color-text-gray)]">(Nepal time)</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--color-text-gray)]">Choose a date and time above.</p>
          )}
        </div>
        <Button type="submit" size="lg" disabled={submitting} className="w-full shrink-0 sm:w-auto">
          {submitting ? "Booking…" : "Book Appointment"}
        </Button>
      </div>
      {submitError && (
        <p role="alert" className="notice notice-error -mt-4">
          {submitError}
        </p>
      )}
    </form>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-xs font-extrabold text-[var(--color-bg-dark)]"
    >
      {n}
    </span>
  )
}
