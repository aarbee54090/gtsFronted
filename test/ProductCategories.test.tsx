import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ProductCategories } from "@/components/landing/ProductCategories"
import { fetchMainProducts } from "@/lib/api"

// Only fetchMainProducts is stubbed - importActual keeps every other export
// (apiFetch, getAdminKey, etc.) real, since @/lib/api is now the single
// shared module for every backend call, not just this component's.
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  fetchMainProducts: vi.fn(() =>
    Promise.resolve([
      { _id: "1", name: "Jersey Kit", thumbnailImageUrl: undefined, description: undefined },
      { _id: "2", name: "Tracksuit", thumbnailImageUrl: undefined, description: undefined },
      { _id: "3", name: "hoodie", thumbnailImageUrl: undefined, description: undefined },
    ])
  ),
}))

describe("ProductCategories", () => {
  it("renders a card for every real main product returned by the backend", async () => {
    render(<ProductCategories />)
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Jersey Kit" })).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "Tracksuit" })).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "hoodie" })).toBeInTheDocument()
    })
  })

  it("links each card using the literal main product name, URL-encoded - no hardcoded slug guessing", async () => {
    render(<ProductCategories />)
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /jersey kit/i })
      expect(link).toHaveAttribute("href", "/customize/Jersey%20Kit")
    })
  })

  it("renders the section heading immediately, before data loads", async () => {
    render(<ProductCategories />)
    expect(
      screen.getByRole("heading", { name: /built for every team, every sport/i })
    ).toBeInTheDocument()
    // Let the pending fetchMainProducts() promise resolve before the test ends,
    // so its state update doesn't leak into the next test as an act() warning.
    await waitFor(() => expect(vi.mocked(fetchMainProducts)).toHaveBeenCalled())
  })
})
