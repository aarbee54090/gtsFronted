import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { DesignSelectionStep } from "@/components/customize/DesignSelectionStep"
import { MOCK_PRODUCTS, getProductForSport } from "@/lib/mock-products"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const footballKit = getProductForSport(MOCK_PRODUCTS["jersey-kit"], "Football")

describe("DesignSelectionStep", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("disables Continue until a design is chosen", () => {
    render(
      <DesignSelectionStep product={footballKit} categoryId="jersey-kit" sportSlug="football" />
    )
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled()
  })

  it("enables Continue once a design is selected", async () => {
    const user = userEvent.setup()
    render(
      <DesignSelectionStep product={footballKit} categoryId="jersey-kit" sportSlug="football" />
    )

    await user.click(screen.getByText("Classic Stripe"))

    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled()
  })

  it("navigates to the customize route with the chosen design id", async () => {
    const user = userEvent.setup()
    render(
      <DesignSelectionStep product={footballKit} categoryId="jersey-kit" sportSlug="football" />
    )

    await user.click(screen.getByText("Classic Stripe"))
    await user.click(screen.getByRole("button", { name: /continue/i }))

    expect(mockPush).toHaveBeenCalledWith(
      "/customize/jersey-kit/football/football-classic-stripe"
    )
  })

  it("does not render a side preview panel - removed in favor of the full-width design grid", () => {
    render(
      <DesignSelectionStep product={footballKit} categoryId="jersey-kit" sportSlug="football" />
    )
    expect(screen.queryByRole("heading", { name: /^preview$/i })).not.toBeInTheDocument()
  })
})
