import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { CheckoutPage } from "@/components/customize/CheckoutPage"
import { saveOrderDraft, clearOrderDraft, type OrderDraft } from "@/lib/order-draft"

const mockApiFetch = vi.fn()
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual("@/lib/api")
  return {
    ...actual,
    apiFetch: (...args: unknown[]) => mockApiFetch(...args),
  }
})

const sampleDraft: OrderDraft = {
  productName: "Football Jersey Kit",
  designName: "Classic Stripe",
  categoryId: "jersey-kit",
  sportSlug: "football",
  sleeveBreakdown: [{ label: "Full Sleeve", quantity: 5 }],
  collarBreakdown: [],
  addonLines: [],
  players: [],
  additionalFiles: [],
  quantity: 5,
  deadlineDate: "",
  couponCode: "",
  quote: {
    unitPrice: 450,
    lineTotal: 2250,
    addonsTotal: 0,
    variantSurcharge: 0,
    subtotal: 2250,
    quantityDiscount: 0,
    couponDiscount: 0,
    discount: 0,
    total: 1000,
    currency: "₹",
  },
}

beforeEach(() => {
  clearOrderDraft()
  mockApiFetch.mockReset()
  // Default: /payment-config fetch fails (not set up) unless a test overrides it.
  mockApiFetch.mockRejectedValue(new Error("not found"))
})

describe("CheckoutPage", () => {
  it("shows a friendly message when no order draft exists", async () => {
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(screen.getByText(/no order in progress/i)).toBeInTheDocument()
    })
  })

  it("shows the order recap when a draft exists", async () => {
    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(screen.getByText("Football Jersey Kit")).toBeInTheDocument()
      expect(screen.getByText("Classic Stripe")).toBeInTheDocument()
    })
  })

  it("calculates the 40% advance / 60% balance split correctly", async () => {
    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(screen.getByText("₹400")).toBeInTheDocument()
      expect(screen.getByText("₹600")).toBeInTheDocument()
    })
  })

  it("shows a QR placeholder when payment config isn't set up yet", async () => {
    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(screen.getByText(/qr code not set up yet/i)).toBeInTheDocument()
    })
  })

  it("shows the real QR image once payment config loads", async () => {
    mockApiFetch.mockResolvedValueOnce({ data: { qrCodeImageUrl: "https://res.cloudinary.com/demo/qr.png" } })
    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(screen.getByAltText("Payment QR code")).toBeInTheDocument()
    })
  })

  it("disables Confirm Order until name, phone, and receipt are all provided", async () => {
    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /confirm order/i })).toBeDisabled()
    })
  })

  it("submits the order as FormData with the raw receipt file, showing the real order ID", async () => {
    const user = userEvent.setup()
    mockApiFetch
      .mockRejectedValueOnce(new Error("no payment config")) // payment-config fetch
      .mockResolvedValueOnce({ data: { orderId: "GTS-REAL1234" } }) // POST /orders

    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)

    await waitFor(() => screen.getByText("Football Jersey Kit"))

    await user.type(screen.getByLabelText(/name/i), "Test Customer")
    await user.type(screen.getByLabelText(/phone/i), "9800000000")

    const file = new File(["fake-receipt"], "receipt.png", { type: "image/png" })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)

    await user.click(screen.getByRole("button", { name: /confirm order/i }))

    await waitFor(() => {
      expect(screen.getByText(/order submitted/i)).toBeInTheDocument()
      expect(screen.getByText("GTS-REAL1234")).toBeInTheDocument()
    })

    // Verify the actual POST call used FormData with the raw file, not a URL string.
    const postCall = mockApiFetch.mock.calls.find((call) => call[0] === "/orders")
    expect(postCall).toBeDefined()
    const formData = postCall![1].body as FormData
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get("receipt")).toBeInstanceOf(File)
    expect((formData.get("receipt") as File).name).toBe("receipt.png")
    expect(JSON.parse(formData.get("contact") as string)).toEqual({ name: "Test Customer", phone: "9800000000" })
  })

  it("shows an error message if order creation fails", async () => {
    const user = userEvent.setup()
    mockApiFetch
      .mockRejectedValueOnce(new Error("no payment config"))
      .mockRejectedValueOnce(new Error("Server error"))

    saveOrderDraft(sampleDraft)
    render(<CheckoutPage />)

    await waitFor(() => screen.getByText("Football Jersey Kit"))

    await user.type(screen.getByLabelText(/name/i), "Test Customer")
    await user.type(screen.getByLabelText(/phone/i), "9800000000")

    const file = new File(["fake-receipt"], "receipt.png", { type: "image/png" })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)

    await user.click(screen.getByRole("button", { name: /confirm order/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })
})
