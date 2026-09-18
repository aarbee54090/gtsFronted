import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Navbar } from "@/components/landing/Navbar"

describe("Navbar", () => {
  it("renders the GTS logo", () => {
    render(<Navbar />)
    expect(screen.getByRole("img", { name: "GTS" })).toBeInTheDocument()
  })

  it("renders navigation links", () => {
    render(<Navbar />)
    expect(screen.getByRole("link", { name: /products/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /how it works/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /track order/i })).toBeInTheDocument()
  })

  it("renders the primary CTA", () => {
    render(<Navbar />)
    expect(screen.getByRole("link", { name: /shop now/i })).toBeInTheDocument()
  })
})
