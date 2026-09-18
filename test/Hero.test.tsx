import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Hero } from "@/components/landing/Hero"

describe("Hero", () => {
  it("renders the headline with highlighted word", () => {
    render(<Hero />)
    expect(screen.getByText(/identity\./i)).toBeInTheDocument()
  })

  it("renders the primary CTA linking to /customize", () => {
    render(<Hero />)
    const cta = screen.getByRole("link", { name: /start customizing/i })
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAttribute("href", "/customize")
  })

  it("renders the track order CTA linking to /track", () => {
    render(<Hero />)
    const trackLink = screen.getByRole("link", { name: /track my order/i })
    expect(trackLink).toBeInTheDocument()
    expect(trackLink).toHaveAttribute("href", "/track")
  })
})
