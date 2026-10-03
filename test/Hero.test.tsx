import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Hero } from "@/components/landing/Hero"

describe("Hero", () => {
  it("has one h1 that says what GTS makes and where", () => {
    render(<Hero />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1).toHaveTextContent(/custom jersey printing in kathmandu, nepal/i)
    expect(h1).toHaveTextContent(/wear your identity\./i)
  })

  it("leads with the ordering CTA", () => {
    render(<Hero />)
    expect(screen.getByRole("link", { name: /start customizing/i })).toHaveAttribute("href", "/products")
  })

  it("offers WhatsApp, using the CMS number when given", () => {
    render(<Hero whatsapp="+977 970-574-3117" />)
    const link = screen.getByRole("link", { name: /chat on whatsapp/i })
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/9779705743117\?text=/)
  })

  it("links to booking a visit", () => {
    render(<Hero />)
    expect(screen.getByRole("link", { name: /book a visit/i })).toHaveAttribute("href", "/gts-hub/contact#book-a-visit")
  })

  it("places the jersey image after the description and before the Start Customizing button", () => {
    const { container } = render(<Hero />)
    const description = screen.getByText(/football, cricket, basketball, volleyball and esports jerseys/i)
    const image = screen.getByRole("img", { name: /concept jerseys for football, basketball, volleyball and cricket/i })
    const cta = screen.getByRole("link", { name: /start customizing/i })
    const order = [...container.querySelectorAll("p, img, a")]
    expect(order.indexOf(description)).toBeLessThan(order.indexOf(image))
    expect(order.indexOf(image)).toBeLessThan(order.indexOf(cta))
    expect(image.getAttribute("src")).toContain("hero-case.webp")
  })

  it("makes no unverified claims (no 'no account needed', no worldwide shipping)", () => {
    const { container } = render(<Hero />)
    expect(container.textContent).not.toMatch(/no account needed/i)
    expect(container.textContent).not.toMatch(/worldwide/i)
  })
})
