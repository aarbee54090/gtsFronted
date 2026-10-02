import { act, render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ProductCategories } from "@/components/landing/ProductCategories"
import type { ProductCard } from "@/lib/catalog"

// The page resolves each main product to its category on the server
// (lib/catalog.ts) and hands the promise down. React 19 needs the render
// awaited inside act() for a component that suspends on that promise.
const PRODUCT_CARDS: ProductCard[] = [
  { _id: "1", name: "Jersey Kit", category: "Jersey Kit", href: "/customize/Jersey%20Kit" },
  { _id: "2", name: "Tracksuit", category: "Tracksuit", href: "/customize/Tracksuit" },
  { _id: "3", name: "Hoodie Custom Designed", category: "Hoodie", href: "/customize/Hoodie" },
]

async function renderWith(productCards: ProductCard[]) {
  await act(async () => {
    render(<ProductCategories productCards={Promise.resolve(productCards)} />)
  })
}

describe("ProductCategories", () => {
  it("renders a card for every resolved main product", async () => {
    await renderWith(PRODUCT_CARDS)
    expect(screen.getByRole("heading", { name: "Jersey Kit" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Tracksuit" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Hoodie Custom Designed" })).toBeInTheDocument()
  })

  it("links each card to the category it resolved to, not its display name", async () => {
    await renderWith(PRODUCT_CARDS)
    // One link per layout (mobile list + desktop grid) - both must match.
    const hoodieLinks = screen.getAllByRole("link", { name: /hoodie custom designed/i })
    expect(hoodieLinks.length).toBeGreaterThan(0)
    for (const link of hoodieLinks) expect(link).toHaveAttribute("href", "/customize/Hoodie")
    for (const link of screen.getAllByRole("link", { name: /jersey kit/i })) {
      expect(link).toHaveAttribute("href", "/customize/Jersey%20Kit")
    }
  })

  it("renders the page h1 immediately, before data loads", () => {
    render(<ProductCategories productCards={new Promise<ProductCard[]>(() => {})} />)
    expect(
      screen.getByRole("heading", { level: 1, name: /built for every team, every sport/i })
    ).toBeInTheDocument()
  })

  it("shows the empty state when there are no products", async () => {
    await renderWith([])
    expect(screen.getByText(/no products available yet/i)).toBeInTheDocument()
  })
})
