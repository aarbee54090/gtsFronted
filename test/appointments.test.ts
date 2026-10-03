import { describe, it, expect } from "vitest"
import {
  addDaysToDateKey,
  dateChipParts,
  formatDateKey,
  formatHour,
  formatLongDate,
  formatMark,
  formatTime,
  formatTimeRange,
  hourWindow,
  kathmanduToday,
  newRequestKey,
  normalizePhone,
} from "@/lib/appointments"

// Same vectors as backend/test/phone.test.js - the form's instant check and
// the server's real one must agree.
const VALID: [string, string][] = [
  ["9812345678", "+9779812345678"],
  ["98-1234-5678", "+9779812345678"],
  ["+977 9812345678", "+9779812345678"],
  ["+977-981-234-5678", "+9779812345678"],
  ["9779812345678", "+9779812345678"],
  ["009779812345678", "+9779812345678"],
  ["9705743117", "+9779705743117"],
  ["9612345678", "+9779612345678"],
  ["01-4123456", "+97714123456"],
  ["014123456", "+97714123456"],
  ["061-512345", "+97761512345"],
  ["+977 1 4123456", "+97714123456"],
  ["+1 415 555 2671", "+14155552671"],
  ["+44 20 7946 0958", "+442079460958"],
]
const INVALID = ["", "   ", "98123", "981234567890", "8812345678", "1234", "+977 1234", "abcdefghij", "+0 123456789", "9812345678; drop", "1".repeat(40)]

describe("normalizePhone", () => {
  it.each(VALID)("accepts %s", (input, expected) => expect(normalizePhone(input)).toBe(expected))
  it.each(INVALID)("rejects %s", (input) => expect(normalizePhone(input)).toBeNull())
})

describe("Kathmandu time formatting", () => {
  // 04:15 UTC is 10:00 in Kathmandu (+05:45).
  const start = "2026-12-01T04:15:00.000Z"
  const end = "2026-12-01T04:45:00.000Z"

  it("shows times in Nepal time regardless of the device's zone", () => {
    expect(formatTime(start)).toBe("10:00 am")
    expect(formatTimeRange(start, end)).toBe("10:00 – 10:30 am")
    // Across noon both periods are shown.
    expect(formatTimeRange("2026-12-01T05:45:00.000Z", "2026-12-01T06:15:00.000Z")).toBe("11:30 am – 12:00 pm")
  })

  it("puts late-UTC instants on the next Kathmandu day", () => {
    expect(formatLongDate("2026-12-01T20:00:00.000Z")).toBe("Wednesday 2 December 2026")
  })

  it("formats date keys as the same calendar day", () => {
    expect(formatDateKey("2026-12-01")).toBe("Tuesday 1 December 2026")
    expect(dateChipParts("2026-12-01")).toEqual({ weekday: "Tue", dayMonth: "1 Dec" })
  })

  it("kathmanduToday follows Kathmandu, not UTC", () => {
    expect(kathmanduToday(new Date("2026-10-14T18:14:00Z"))).toBe("2026-10-14")
    expect(kathmanduToday(new Date("2026-10-14T18:15:00Z"))).toBe("2026-10-15")
  })

  it("addDaysToDateKey crosses month and year ends", () => {
    expect(addDaysToDateKey("2026-10-31", 1)).toBe("2026-11-01")
    expect(addDaysToDateKey("2026-12-31", 1)).toBe("2027-01-01")
  })

  it("hourWindow rounds a day's times out to whole Kathmandu hours", () => {
    // 10:00-11:30 in Kathmandu -> 10:00-12:00 (04:15Z-06:15Z).
    expect(hourWindow("2026-12-01T04:15:00.000Z", "2026-12-01T05:45:00.000Z")).toEqual({
      start: Date.parse("2026-12-01T04:15:00.000Z"),
      end: Date.parse("2026-12-01T06:15:00.000Z"),
    })
    // 9:30-17:00 -> 9:00-17:00: an end already on the hour stays put.
    expect(hourWindow("2026-12-01T03:45:00.000Z", "2026-12-01T11:15:00.000Z")).toEqual({
      start: Date.parse("2026-12-01T03:15:00.000Z"),
      end: Date.parse("2026-12-01T11:15:00.000Z"),
    })
  })

  it("formatHour labels hour marks in Nepal time", () => {
    expect(formatHour(Date.parse("2026-12-01T03:15:00.000Z"))).toBe("9 am")
    expect(formatHour(Date.parse("2026-12-01T06:15:00.000Z"))).toBe("12 pm")
    expect(formatHour(Date.parse("2026-12-01T07:15:00.000Z"))).toBe("1 pm")
  })

  it("formatMark labels the hour with its period and the half hour without", () => {
    expect(formatMark(Date.parse("2026-12-01T10:15:00.000Z"))).toBe("4 pm")
    expect(formatMark(Date.parse("2026-12-01T10:45:00.000Z"))).toBe("4:30")
  })
})

describe("newRequestKey", () => {
  it("is unique per attempt and matches the backend's accepted format", () => {
    const a = newRequestKey()
    const b = newRequestKey()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9_-]{8,100}$/)
  })
})
