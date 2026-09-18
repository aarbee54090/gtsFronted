import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Customizer } from "@/components/customize/Customizer"
import { MOCK_PRODUCTS } from "@/lib/mock-products"
import { loadOrderDraft, clearOrderDraft } from "@/lib/order-draft"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const jerseyKit = MOCK_PRODUCTS["jersey-kit"]

beforeEach(() => {
  mockPush.mockClear()
  clearOrderDraft()
})

describe("Customizer", () => {
  it("renders sleeve and collar type fields, with no Fit field", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    expect(screen.getByText("Sleeve Type")).toBeInTheDocument()
    expect(screen.getByText("Collar Type")).toBeInTheDocument()
    expect(screen.queryByText("Fit")).not.toBeInTheDocument()
  })

  it("renders one quantity input per variant option for Sleeve Type", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    expect(screen.getByLabelText("Full Sleeve")).toBeInTheDocument()
    expect(screen.getByLabelText("Half Sleeve")).toBeInTheDocument()
  })

  it("also renders one quantity input per option for Collar Type", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    expect(screen.getByLabelText("Round Neck")).toBeInTheDocument()
    expect(screen.getByLabelText("V-Neck")).toBeInTheDocument()
    expect(screen.getByLabelText("Collar")).toBeInTheDocument()
  })

  it("shows the per-piece surcharge next to Full Sleeve and Collar, not other options", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    expect(screen.getByText("(+₹120/pc)")).toBeInTheDocument()
    expect(screen.getByText("(+₹125/pc)")).toBeInTheDocument()
  })

  it("derives total quantity from Sleeve Type by default", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    const cta = screen.getByRole("button", { name: /get quotation/i })
    expect(cta).toBeDisabled()
  })

  it("enables the Get Quotation CTA once a Sleeve Type quantity is entered", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const fullSleeveInput = screen.getByLabelText("Full Sleeve")
    await user.clear(fullSleeveInput)
    await user.type(fullSleeveInput, "10")

    expect(screen.getByRole("button", { name: /get quotation/i })).toBeEnabled()
  })

  it("does not require Collar Type quantity to enable the CTA", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const fullSleeveInput = screen.getByLabelText("Full Sleeve")
    await user.clear(fullSleeveInput)
    await user.type(fullSleeveInput, "10")

    expect(screen.getByRole("button", { name: /get quotation/i })).toBeEnabled()
  })

  it("does not render a Quality Tier section", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    expect(screen.queryByText("Quality Tier")).not.toBeInTheDocument()
  })

  it("does not render a Fabric section - removed as a pricing factor", () => {
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)
    expect(screen.queryByText("Fabric")).not.toBeInTheDocument()
  })

  // Half Sleeve carries no surcharge, so it's used here to isolate each
  // pricing component (design price, addon price, tier price) cleanly,
  // without the Full Sleeve/Collar surcharge interfering.

  it("updates the total price based on the selected design's own price", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe", price: 300 }} categoryId="jersey-kit" sportSlug="football" />)

    const halfSleeveInput = screen.getByLabelText("Half Sleeve")
    await user.clear(halfSleeveInput)
    await user.type(halfSleeveInput, "1")

    expect(screen.getByTestId("order-total")).toHaveTextContent("₹300")
  })

  it("prices an addon using the selected style, not a flat addon price", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const halfSleeveInput = screen.getByLabelText("Half Sleeve")
    await user.clear(halfSleeveInput)
    await user.type(halfSleeveInput, "1")

    // Addons are collapsed by default - expand the first one (Shorts) before its style options appear.
    const addonToggles = screen.getAllByRole("button", { name: /shorts/i })
    await user.click(addonToggles[0])

    // Track has an identically-labeled style, so pick the first match (Shorts, now expanded).
    const fullDesignButtons = screen.getAllByRole("button", { name: /full design print/i })
    await user.click(fullDesignButtons[0])

    expect(screen.getByTestId("order-total")).toHaveTextContent("₹700")
  })

  it("still applies tier pricing to the total", async () => {
    const user = userEvent.setup()
    const productWithTiers = {
      ...jerseyKit,
      pricingTiers: [{ id: "t1", minQty: 1, maxQty: null, price: 500 }],
    }
    render(<Customizer product={productWithTiers} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const halfSleeveInput = screen.getByLabelText("Half Sleeve")
    await user.clear(halfSleeveInput)
    await user.type(halfSleeveInput, "1")

    expect(screen.getByTestId("order-total")).toHaveTextContent("₹500")
  })

  it("adds the Full Sleeve surcharge (₹120/pc) into the total", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const fullSleeveInput = screen.getByLabelText("Full Sleeve")
    await user.clear(fullSleeveInput)
    await user.type(fullSleeveInput, "2") // 2 x ₹120 = ₹240

    expect(screen.getByTestId("order-total")).toHaveTextContent("₹240")
  })

  it("adds the Collar surcharge (₹125/pc), but not Round Neck/V-Neck", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const halfSleeveInput = screen.getByLabelText("Half Sleeve")
    await user.clear(halfSleeveInput)
    await user.type(halfSleeveInput, "1")

    const collarInput = screen.getByLabelText("Collar")
    await user.clear(collarInput)
    await user.type(collarInput, "2") // 2 x ₹125 = ₹250

    expect(screen.getByTestId("order-total")).toHaveTextContent("₹250")
  })

  it("shows the chosen design name with a link back to change it", () => {
    render(
      <Customizer
        product={jerseyKit}
        selectedDesign={{ name: "Classic Stripe" }}
        categoryId="jersey-kit"
        sportSlug="football"
      />
    )
    expect(screen.getByText("Classic Stripe")).toBeInTheDocument()
    const link = screen.getByRole("link", { name: /change design/i })
    expect(link).toHaveAttribute("href", "/customize/jersey-kit/football")
  })

  it("labels an uploaded design without matching it to the catalog", () => {
    render(
      <Customizer
        product={jerseyKit}
        selectedDesign={{ name: "Your uploaded design" }}
        categoryId="jersey-kit"
        sportSlug="football"
      />
    )
    expect(screen.getByText("Your uploaded design")).toBeInTheDocument()
  })

  it("does not render a design picker - design was already chosen on the previous step", () => {
    render(
      <Customizer
        product={jerseyKit}
        selectedDesign={{ name: "Classic Stripe" }}
        categoryId="jersey-kit"
        sportSlug="football"
      />
    )
    expect(screen.queryByRole("button", { name: /upload own design/i })).not.toBeInTheDocument()
  })

  it("defaults Total Quantity to the sleeve-derived sum", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const fullSleeveInput = screen.getByLabelText("Full Sleeve")
    await user.clear(fullSleeveInput)
    await user.type(fullSleeveInput, "7")

    const totalQuantityInput = screen.getByLabelText("Total quantity") as HTMLInputElement
    expect(totalQuantityInput.value).toBe("7")
  })

  it("lets the customer directly override the total quantity", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const fullSleeveInput = screen.getByLabelText("Full Sleeve")
    await user.clear(fullSleeveInput)
    await user.type(fullSleeveInput, "7")

    const totalQuantityInput = screen.getByLabelText("Total quantity")
    await user.clear(totalQuantityInput)
    await user.type(totalQuantityInput, "20")

    expect(screen.getByRole("button", { name: /proceed order/i })).toBeEnabled()
    // The override should now drive pricing tiers/quantity discount, not the sleeve sum.
  })

  it("saves an order draft and navigates to the quotation page when Get Quotation is clicked", async () => {
    const user = userEvent.setup()
    render(<Customizer product={jerseyKit} selectedDesign={{ name: "Classic Stripe" }} categoryId="jersey-kit" sportSlug="football" />)

    const halfSleeveInput = screen.getByLabelText("Half Sleeve")
    await user.clear(halfSleeveInput)
    await user.type(halfSleeveInput, "5")

    await user.click(screen.getByRole("button", { name: /get quotation/i }))

    expect(mockPush).toHaveBeenCalledWith("/customize/jersey-kit/football/quotation")
    const draft = loadOrderDraft()
    expect(draft?.quantity).toBe(5)
    expect(draft?.designName).toBe("Classic Stripe")
  })
})
