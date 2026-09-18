import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SportPicker } from "@/components/customize/SportPicker"
import type { BackendProductSummary } from "@/lib/api"

const mockSports: BackendProductSummary[] = [
  { _id: "1", name: "Football Jersey Kit", category: "Jersey Kit", sport: "Football" },
  { _id: "2", name: "Volleyball Jersey Kit", category: "Jersey Kit", sport: "Volleyball" },
]

describe("SportPicker", () => {
  it("renders a card for every sport variant passed in", () => {
    render(<SportPicker categorySlug="jersey-kit" categoryName="Jersey Kit" sports={mockSports} />)
    expect(screen.getByText("Football Jersey Kit")).toBeInTheDocument()
    expect(screen.getByText("Volleyball Jersey Kit")).toBeInTheDocument()
  })

  it("links each sport to the customize flow with category and sport slugs", () => {
    render(<SportPicker categorySlug="jersey-kit" categoryName="Jersey Kit" sports={mockSports} />)
    const footballLink = screen.getByRole("link", { name: /football jersey kit/i })
    expect(footballLink).toHaveAttribute("href", "/customize/jersey-kit/football")
  })

  it("shows an empty state when no sports exist for the category", () => {
    render(<SportPicker categorySlug="jersey-kit" categoryName="Jersey Kit" sports={[]} />)
    expect(screen.getByText(/no sports available yet/i)).toBeInTheDocument()
  })
})
