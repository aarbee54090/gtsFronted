import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

let pathname = "/"
vi.mock("next/navigation", () => ({ usePathname: () => pathname }))
// The profile menu needs the customer session provider; it isn't what's under test here.
vi.mock("@/components/account/ProfileMenu", () => ({ ProfileMenu: () => <span>Profile</span> }))

import { Navbar, activeNavHref } from "@/components/landing/Navbar"

describe("Navbar", () => {
  beforeEach(() => {
    pathname = "/"
  })

  it("renders the GTS logo linking home", () => {
    render(<Navbar />)
    const logo = screen.getByRole("img", { name: "GoalThali Sports" })
    expect(logo.closest("a")).toHaveAttribute("href", "/")
  })

  it("links to Our Work (keeping the existing /gts-hub/portfolio URL) and the other sections", () => {
    render(<Navbar />)
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(within(nav).getByRole("link", { name: "Our Work" })).toHaveAttribute("href", "/gts-hub/portfolio")
    expect(within(nav).getByRole("link", { name: "Products" })).toHaveAttribute("href", "/products")
    expect(within(nav).getByRole("link", { name: "How It Works" })).toHaveAttribute("href", "/process")
    expect(within(nav).getByRole("link", { name: "GTS Hub" })).toHaveAttribute("href", "/gts-hub")
    expect(within(nav).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/gts-hub/contact")
    expect(within(nav).queryByRole("link", { name: /portfolio/i })).not.toBeInTheDocument()
  })

  it("keeps the ordering CTA prominent", () => {
    render(<Navbar />)
    expect(screen.getByRole("link", { name: /start customizing/i })).toHaveAttribute("href", "/products")
  })

  it("marks only the most specific section as current", () => {
    pathname = "/gts-hub/portfolio/team-rayzrs"
    render(<Navbar />)
    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(within(nav).getByRole("link", { name: "Our Work" })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", { name: "GTS Hub" })).not.toHaveAttribute("aria-current")
  })

  it("opens and closes the mobile menu, including with Escape", () => {
    render(<Navbar />)
    const toggle = screen.getByRole("button", { name: "Open menu" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(toggle)
    const menu = screen.getByRole("navigation", { name: "Mobile navigation" })
    expect(within(menu).getByRole("link", { name: "Track Order" })).toHaveAttribute("href", "/track")
    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument()
  })
})

describe("activeNavHref", () => {
  it.each([
    ["/", null],
    ["/products", "/products"],
    ["/customize/Hoodie/hoodie", "/products"],
    ["/gts-hub", "/gts-hub"],
    ["/gts-hub/journal/fabric-guide", "/gts-hub"],
    ["/gts-hub/portfolio", "/gts-hub/portfolio"],
    ["/gts-hub/contact", "/gts-hub/contact"],
    ["/track", "/track"],
  ])("%s -> %s", (path, expected) => {
    expect(activeNavHref(path)).toBe(expected)
  })
})
