import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import { ViewPricingButton } from "@/components/customize/ViewPricingButton"
import type { Design, PricingTier } from "@/lib/types"

const designs: Design[] = [
  { id: "d1", name: "Design One", sport: "Football", price: 450 },
  { id: "d2", name: "Design Two", sport: "Football", price: 500 },
]

const designsNoPrice: Design[] = [
  { id: "d1", name: "Design One", sport: "Football" },
]

const tiers: PricingTier[] = [
  { id: "t1", minQty: 1, maxQty: 2, price: 500 },
  { id: "t2", minQty: 3, maxQty: null, price: 450 },
]

describe("ViewPricingButton", () => {
  it("renders the trigger button", () => {
    render(<ViewPricingButton designs={designs} pricingTiers={[]} currency="₹" />)
    expect(screen.getByRole("button", { name: /view pricing/i })).toBeInTheDocument()
  })

  it("does not show the pricing modal until clicked", () => {
    render(<ViewPricingButton designs={designs} pricingTiers={[]} currency="₹" />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows quantity tiers when the product has them", async () => {
    const user = userEvent.setup()
    render(<ViewPricingButton designs={designsNoPrice} pricingTiers={tiers} currency="₹" />)

    await user.click(screen.getByRole("button", { name: /view pricing/i }))

    expect(screen.getByText("Price by Quantity")).toBeInTheDocument()
    expect(screen.getByText("1-2 pcs")).toBeInTheDocument()
    expect(screen.getByText("₹500 / pc")).toBeInTheDocument()
    expect(screen.getByText("3+ pcs")).toBeInTheDocument()
    expect(screen.getByText("₹450 / pc")).toBeInTheDocument()
  })

  it("shows per-design prices when any design has one", async () => {
    const user = userEvent.setup()
    render(<ViewPricingButton designs={designs} pricingTiers={[]} currency="₹" />)

    await user.click(screen.getByRole("button", { name: /view pricing/i }))

    expect(screen.getByText("Price by Design")).toBeInTheDocument()
    expect(screen.getByText("Design One")).toBeInTheDocument()
    expect(screen.getByText("₹450")).toBeInTheDocument()
  })

  it("shows both sections together when both exist", async () => {
    const user = userEvent.setup()
    render(<ViewPricingButton designs={designs} pricingTiers={tiers} currency="₹" />)

    await user.click(screen.getByRole("button", { name: /view pricing/i }))

    expect(screen.getByText("Price by Quantity")).toBeInTheDocument()
    expect(screen.getByText("Price by Design")).toBeInTheDocument()
  })

  it("shows a helpful empty state when neither pricing type is set", async () => {
    const user = userEvent.setup()
    render(<ViewPricingButton designs={designsNoPrice} pricingTiers={[]} currency="₹" />)

    await user.click(screen.getByRole("button", { name: /view pricing/i }))

    expect(screen.getByText(/no pricing has been set/i)).toBeInTheDocument()
  })

  it("closes the modal when the close button is clicked", async () => {
    const user = userEvent.setup()
    render(<ViewPricingButton designs={designs} pricingTiers={tiers} currency="₹" />)

    await user.click(screen.getByRole("button", { name: /view pricing/i }))
    await user.click(screen.getByRole("button", { name: /close pricing/i }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
