import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { VisitCalendar } from "@/components/contact/VisitCalendar"

const DAYS = [
  { date: "2026-12-30", available: 3 },
  { date: "2026-12-31", available: 0 }, // hours, but no times left to pick
]

function renderCalendar(onSelect = vi.fn(), selected: string | null = "2026-12-30") {
  render(<VisitCalendar firstDate="2026-12-29" lastDate="2027-01-10" days={DAYS} selected={selected} onSelect={onSelect} />)
  return onSelect
}

describe("VisitCalendar", () => {
  it("starts on the selected date's month, with weekdays aligned (1 Dec 2026 is a Tuesday)", () => {
    renderCalendar()
    expect(screen.getByText("December 2026")).toBeInTheDocument()
    const cells = screen.getByRole("group", { name: "Dates in December 2026" }).querySelectorAll("div.grid-cols-7:last-child > *")
    // Sunday-first grid: two blanks before Tuesday the 1st.
    expect(cells[0].tagName).toBe("SPAN")
    expect(cells[1].tagName).toBe("SPAN")
    expect(cells[2]).toHaveTextContent("1")
  })

  it("describes each day's availability and disables dates outside the window", () => {
    renderCalendar()
    expect(screen.getByRole("button", { name: /wednesday 30 december 2026, 3 times available/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /thursday 31 december 2026, no times/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /monday 28 december 2026, not bookable/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /tuesday 29 december 2026, no times/i })).toBeEnabled()
  })

  it("picks a date on click", () => {
    const onSelect = renderCalendar()
    fireEvent.click(screen.getByRole("button", { name: /tuesday 29 december 2026/i }))
    expect(onSelect).toHaveBeenCalledWith("2026-12-29")
  })

  it("moves by day and week with the arrow keys, across months, and stays inside the window", async () => {
    vi.useFakeTimers()
    renderCalendar()
    const start = screen.getByRole("button", { name: /wednesday 30 december 2026/i })
    expect(start).toHaveAttribute("tabindex", "0")

    fireEvent.keyDown(start, { key: "ArrowDown" })
    await act(async () => vi.runAllTimers())
    expect(screen.getByText("January 2027")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /wednesday 6 january 2027/i })).toHaveFocus()

    fireEvent.keyDown(screen.getByRole("button", { name: /wednesday 6 january 2027/i }), { key: "ArrowDown" })
    await act(async () => vi.runAllTimers())
    // 13 January is past the window's last date (10 January) - clamped.
    expect(screen.getByRole("button", { name: /sunday 10 january 2027/i })).toHaveFocus()

    fireEvent.keyDown(screen.getByRole("button", { name: /sunday 10 january 2027/i }), { key: "ArrowLeft" })
    await act(async () => vi.runAllTimers())
    expect(screen.getByRole("button", { name: /saturday 9 january 2027/i })).toHaveFocus()
    vi.useRealTimers()
  })

  it("follows a date picked from outside the calendar into its month", () => {
    const { rerender } = render(
      <VisitCalendar firstDate="2026-12-29" lastDate="2027-01-10" days={DAYS} selected="2026-12-30" onSelect={vi.fn()} />
    )
    expect(screen.getByText("December 2026")).toBeInTheDocument()
    rerender(<VisitCalendar firstDate="2026-12-29" lastDate="2027-01-10" days={DAYS} selected="2027-01-05" onSelect={vi.fn()} />)
    expect(screen.getByText("January 2027")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /tuesday 5 january 2027/i })).toHaveAttribute("aria-pressed", "true")
  })
})
