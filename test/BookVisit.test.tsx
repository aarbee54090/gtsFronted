import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AvailabilitySummary, DayAvailability, VisitTime } from "@/lib/appointment-types"

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>()
  return { ...actual, getAppointmentAvailability: vi.fn(), getAppointmentDay: vi.fn(), requestAppointment: vi.fn() }
})

import { ApiError, getAppointmentAvailability, getAppointmentDay, requestAppointment } from "@/lib/api"
import { BookVisit } from "@/components/contact/BookVisit"

const getSummary = vi.mocked(getAppointmentAvailability)
const getDay = vi.mocked(getAppointmentDay)
const book = vi.mocked(requestAppointment)

const SUMMARY: AvailabilitySummary = {
  firstDate: "2026-12-01",
  lastDate: "2027-01-29",
  days: [
    { date: "2026-12-01", available: 4 },
    { date: "2026-12-02", available: 0 }, // has hours, but every time is too soon
    { date: "2026-12-03", available: 2 },
  ],
}

// Times are UTC: 10:15Z is 16:00 in Kathmandu, 08:15Z is 14:00.
const time = (startsAt: string, status: VisitTime["status"] = "available"): VisitTime => ({ startsAt, status })
const DAYS: Record<string, DayAvailability> = {
  "2026-12-01": {
    date: "2026-12-01",
    bookable: true,
    hours: { slotId: "d1", startsAt: "2026-12-01T10:15:00.000Z", endsAt: "2026-12-01T11:15:00.000Z" },
    times: [
      time("2026-12-01T10:15:00.000Z"),
      time("2026-12-01T10:30:00.000Z"),
      time("2026-12-01T10:45:00.000Z"),
      time("2026-12-01T11:00:00.000Z"),
    ],
  },
  "2026-12-02": {
    date: "2026-12-02",
    bookable: true,
    hours: { slotId: "d2", startsAt: "2026-12-02T10:15:00.000Z", endsAt: "2026-12-02T10:45:00.000Z" },
    times: [time("2026-12-02T10:15:00.000Z", "unavailable"), time("2026-12-02T10:30:00.000Z", "unavailable")],
  },
  "2026-12-03": {
    date: "2026-12-03",
    bookable: true,
    hours: { slotId: "d3", startsAt: "2026-12-03T08:15:00.000Z", endsAt: "2026-12-03T08:45:00.000Z" },
    times: [time("2026-12-03T08:15:00.000Z"), time("2026-12-03T08:30:00.000Z")],
  },
}

const noHours = (date: string): DayAvailability => ({ date, bookable: true, hours: null, times: [] })

async function renderLoaded(summary = SUMMARY) {
  getSummary.mockResolvedValue(summary)
  getDay.mockImplementation(async (date) => DAYS[date] ?? noHours(date))
  await act(async () => {
    render(<BookVisit whatsapp="9779705743117" />)
  })
}

const slider = () => screen.getByRole("slider", { name: "Arrival time" })
const chosenTime = () => slider().getAttribute("aria-valuetext")
const dateButton = (label: RegExp) => screen.getByRole("button", { name: label })
const yourAppointment = () => screen.getByText(/your appointment/i).parentElement

// 1 December's line runs 16:00-17:00. Put it 328px wide (300px between the
// 14px insets), so each minute is 5px and 16:00 + m sits at 14 + m * 5.
function placeLine() {
  vi.spyOn(slider(), "getBoundingClientRect").mockReturnValue({ left: 0, width: 328, top: 0, height: 44 } as DOMRect)
}
const xFor = (minutesAfterFour: number) => 14 + minutesAfterFour * 5

function fillDetails(name = "Asha Gurung", phone = "9812345678") {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: name } })
  fireEvent.change(screen.getByLabelText(/contact number/i), { target: { value: phone } })
}

describe("BookVisit", () => {
  beforeEach(() => {
    getSummary.mockReset()
    getDay.mockReset()
    book.mockReset()
  })

  it("shows a loading state first", () => {
    getSummary.mockReturnValue(new Promise(() => {}))
    render(<BookVisit />)
    expect(screen.getByLabelText(/loading the booking calendar/i)).toBeInTheDocument()
  })

  it("opens on the first date with times, on its first arrival time", async () => {
    await renderLoaded()
    expect(screen.getByText("December 2026")).toBeInTheDocument()
    expect(dateButton(/tuesday 1 december 2026, 4 times available/i)).toHaveAttribute("aria-pressed", "true")
    expect(getDay).toHaveBeenCalledWith("2026-12-01")
    expect(chosenTime()).toBe("4:00 pm")
    expect(yourAppointment()).toHaveTextContent("Tuesday 1 December 2026, 4:00 pm")
    expect(screen.getByTitle("4:15 pm · Available")).toHaveAttribute("data-status", "available")
  })

  it("lets customers pick any date in the booking window, but not before or after it", async () => {
    await renderLoaded()
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled()
    // A date with no hours at all is still pickable.
    expect(dateButton(/saturday 5 december 2026, no times/i)).toBeEnabled()
    fireEvent.click(screen.getByRole("button", { name: "Next month" }))
    expect(screen.getByText("January 2027")).toBeInTheDocument()
    expect(dateButton(/friday 29 january 2027/i)).toBeEnabled()
    expect(dateButton(/saturday 30 january 2027, not bookable/i)).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled()
  })

  it("steps through the times with the arrow keys and the Earlier/Later buttons", async () => {
    await renderLoaded()
    expect(screen.getByRole("button", { name: "Earlier time" })).toBeDisabled()

    fireEvent.keyDown(slider(), { key: "ArrowRight" })
    expect(chosenTime()).toBe("4:15 pm")
    expect(slider()).toHaveAttribute("aria-valuenow", "1")
    fireEvent.keyDown(slider(), { key: "End" })
    expect(chosenTime()).toBe("4:45 pm")
    expect(screen.getByRole("button", { name: "Later time" })).toBeDisabled()
    fireEvent.keyDown(slider(), { key: "Home" })
    expect(chosenTime()).toBe("4:00 pm")

    fireEvent.click(screen.getByRole("button", { name: "Later time" }))
    expect(chosenTime()).toBe("4:15 pm")
    fireEvent.click(screen.getByRole("button", { name: "Earlier time" }))
    expect(chosenTime()).toBe("4:00 pm")
  })

  it("snaps a tap or a drag along the line to the nearest time", async () => {
    await renderLoaded()
    placeLine()

    fireEvent.pointerDown(slider(), { clientX: xFor(20), pointerId: 1 })
    fireEvent.pointerUp(slider(), { clientX: xFor(20), pointerId: 1 })
    expect(chosenTime()).toBe("4:15 pm")

    fireEvent.pointerDown(slider(), { clientX: xFor(41), pointerId: 1 })
    fireEvent.pointerUp(slider(), { clientX: xFor(41), pointerId: 1 })
    expect(chosenTime()).toBe("4:45 pm")

    // Dragging follows the pointer; moving afterwards doesn't.
    fireEvent.pointerDown(slider(), { clientX: xFor(2), pointerId: 1 })
    fireEvent.pointerMove(slider(), { clientX: xFor(33), pointerId: 1 })
    expect(chosenTime()).toBe("4:30 pm")
    fireEvent.pointerUp(slider(), { clientX: xFor(33), pointerId: 1 })
    fireEvent.pointerMove(slider(), { clientX: xFor(2), pointerId: 1 })
    expect(chosenTime()).toBe("4:30 pm")
    expect(yourAppointment()).toHaveTextContent("Tuesday 1 December 2026, 4:30 pm")
  })

  it("starts another date on its own first time; tapping the same date keeps the choice", async () => {
    await renderLoaded()
    fireEvent.keyDown(slider(), { key: "End" })

    fireEvent.click(dateButton(/tuesday 1 december 2026/i))
    expect(chosenTime()).toBe("4:45 pm")
    expect(getDay).toHaveBeenCalledTimes(1)

    await act(async () => {
      fireEvent.click(dateButton(/thursday 3 december 2026/i))
    })
    expect(getDay).toHaveBeenLastCalledWith("2026-12-03")
    expect(screen.getByText("Thursday 3 December 2026")).toBeInTheDocument()
    expect(chosenTime()).toBe("2:00 pm")
    expect(yourAppointment()).toHaveTextContent("Thursday 3 December 2026, 2:00 pm")
  })

  it("shows the hours of a day whose times are all too soon, with nothing to pick, and offers the next date", async () => {
    await renderLoaded()
    await act(async () => {
      fireEvent.click(dateButton(/wednesday 2 december 2026, no times/i))
    })
    expect(screen.getByText(/there are no free times left on this date/i)).toBeInTheDocument()
    expect(slider()).toHaveAttribute("aria-disabled", "true")
    expect(chosenTime()).toBe("No free times")
    expect(screen.getByText("Too soon to book online")).toBeInTheDocument()
    expect(screen.getByText(/choose a date and time above/i)).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next available: Thu 3 Dec" }))
    })
    expect(dateButton(/thursday 3 december 2026/i)).toHaveAttribute("aria-pressed", "true")
    expect(chosenTime()).toBe("2:00 pm")

    await act(async () => {
      fireEvent.click(dateButton(/saturday 5 december 2026/i))
    })
    expect(screen.getByText(/there are no visiting hours on this date/i)).toBeInTheDocument()
    expect(screen.queryByRole("slider")).not.toBeInTheDocument()
  })

  it("asks for a time, a name, and a valid number before booking", async () => {
    await renderLoaded()
    await act(async () => {
      fireEvent.click(dateButton(/wednesday 2 december 2026/i))
    })
    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    expect(screen.getByText("Choose a time for your visit.")).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(dateButton(/tuesday 1 december 2026/i))
    })
    fillDetails("A", "12345")
    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    expect(screen.queryByText("Choose a time for your visit.")).not.toBeInTheDocument()
    expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a valid number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contact number/i)).toHaveAttribute("aria-invalid", "true")
    expect(book).not.toHaveBeenCalled()
  })

  it("books the chosen arrival time and confirms with a reference and an honest status", async () => {
    await renderLoaded()
    fireEvent.keyDown(slider(), { key: "ArrowRight" })
    fillDetails()
    fireEvent.change(screen.getByLabelText(/reason for visit/i), { target: { value: "Football kit for 20" } })

    book.mockResolvedValue({
      reference: "APT-7KQ2M9XD",
      status: "requested",
      startsAt: "2026-12-01T10:30:00.000Z",
      endsAt: "2026-12-01T10:45:00.000Z",
    })
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    })

    expect(book).toHaveBeenCalledWith(
      expect.objectContaining({
        slotId: "d1",
        startsAt: "2026-12-01T10:30:00.000Z",
        name: "Asha Gurung",
        phone: "9812345678",
        reason: "Football kit for 20",
      })
    )
    expect(book.mock.calls[0][0].requestKey).toMatch(/^[A-Za-z0-9_-]{8,}$/)
    expect(screen.getByRole("heading", { name: "Booking received" })).toBeInTheDocument()
    expect(screen.getByText(/tuesday 1 december 2026, 4:15 pm/i)).toBeInTheDocument()
    expect(screen.getByText("APT-7KQ2M9XD")).toBeInTheDocument()
    expect(screen.getByText("Requested")).toBeInTheDocument()
    expect(screen.getByText(/isn't confirmed yet/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /check status/i })).toHaveAttribute("href", "/appointments/APT-7KQ2M9XD")
  })

  it("when the day was closed meanwhile: explains, refreshes it, clears the time, keeps the details", async () => {
    await renderLoaded()
    fillDetails()

    book.mockRejectedValue(new ApiError("That time is no longer available. Please choose another time.", 409, "slot_unavailable"))
    getDay.mockImplementation(async (date) => (date === "2026-12-01" ? noHours(date) : (DAYS[date] ?? noHours(date))))
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    })

    await waitFor(() => expect(getDay).toHaveBeenCalledTimes(2))
    expect(getSummary).toHaveBeenCalledTimes(2)
    expect(screen.getByRole("alert")).toHaveTextContent(/no longer available/i)
    expect(screen.getByText(/there are no visiting hours on this date/i)).toBeInTheDocument()
    expect(screen.getByText(/choose a date and time above/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Asha Gurung")
  })

  it("one booking per number per day: shows why by the Book button and keeps the chosen time", async () => {
    await renderLoaded()
    fillDetails()
    book.mockRejectedValue(new ApiError("This number already has a visit booked on this day.", 409, "duplicate_booking"))
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    })
    expect(screen.getByRole("alert")).toHaveTextContent(/already has a visit booked on this day/i)
    expect(chosenTime()).toBe("4:00 pm")
    expect(getDay).toHaveBeenCalledTimes(1)
  })

  it("can't be submitted twice, and a retry after a network error reuses the same request key", async () => {
    await renderLoaded()
    fillDetails()

    let rejectFirst!: (err: unknown) => void
    book.mockImplementationOnce(() => new Promise((_, reject) => (rejectFirst = reject)))
    fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    const busy = screen.getByRole("button", { name: "Booking…" })
    expect(busy).toBeDisabled()
    fireEvent.click(busy)
    expect(book).toHaveBeenCalledTimes(1)
    expect(book.mock.calls[0][0]).toMatchObject({ slotId: "d1", startsAt: "2026-12-01T10:15:00.000Z" })

    await act(async () => rejectFirst(new TypeError("Failed to fetch")))
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't book your appointment/i)

    book.mockResolvedValueOnce({ reference: "APT-AAAAAAAA", status: "requested", startsAt: "2026-12-01T10:15:00.000Z", endsAt: "2026-12-01T10:30:00.000Z" })
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Book Appointment" }))
    })
    expect(book).toHaveBeenCalledTimes(2)
    expect(book.mock.calls[1][0].requestKey).toBe(book.mock.calls[0][0].requestKey)
  })

  it("offers WhatsApp when no times are open in the whole window", async () => {
    await renderLoaded({ firstDate: "2026-12-01", lastDate: "2027-01-29", days: [] })
    expect(screen.getByText(/no visit times are open/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /arrange on whatsapp/i }).getAttribute("href")).toMatch(/^https:\/\/wa\.me\/9779705743117/)
  })

  it("lets the customer retry when the calendar fails to load", async () => {
    getSummary.mockRejectedValueOnce(new ApiError("Server unavailable", 503))
    getDay.mockImplementation(async (date) => DAYS[date] ?? noHours(date))
    await act(async () => {
      render(<BookVisit />)
    })
    expect(screen.getByText("Server unavailable")).toBeInTheDocument()
    getSummary.mockResolvedValueOnce(SUMMARY)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    })
    expect(chosenTime()).toBe("4:00 pm")
  })
})
