import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { Customizer } from "@/components/customize/Customizer"
import { MOCK_PRODUCTS } from "@/lib/mock-products"
import { saveUploadedDesignImage, loadUploadedDesignImage } from "@/lib/uploaded-design"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const jerseyKit = MOCK_PRODUCTS["jersey-kit"]
const FAKE_DATA_URL = "data:image/png;base64,fakeimagedata"

beforeEach(() => {
  sessionStorage.clear()
})

describe("Customizer - uploaded design image", () => {
  it("shows the real uploaded image, not just placeholder text, when one was saved", async () => {
    saveUploadedDesignImage(FAKE_DATA_URL)

    render(
      <Customizer
        product={jerseyKit}
        selectedDesign={{ name: "Your uploaded design" }}
        categoryId="jersey-kit"
        sportSlug="football"
      />
    )

    await waitFor(() => {
      const img = screen.getByAltText("Your uploaded design") as HTMLImageElement
      expect(img).toBeInTheDocument()
    })
  })

  it("clears the saved image from sessionStorage after reading it once", async () => {
    saveUploadedDesignImage(FAKE_DATA_URL)

    render(
      <Customizer
        product={jerseyKit}
        selectedDesign={{ name: "Your uploaded design" }}
        categoryId="jersey-kit"
        sportSlug="football"
      />
    )

    await waitFor(() => {
      expect(screen.getByAltText("Your uploaded design")).toBeInTheDocument()
    })
    expect(loadUploadedDesignImage()).toBeNull()
  })

  it("does not try to load an uploaded image for a real catalog design that already has one", () => {
    render(
      <Customizer
        product={jerseyKit}
        selectedDesign={{ name: "Classic Stripe", imageUrl: "https://example.com/real.png" }}
        categoryId="jersey-kit"
        sportSlug="football"
      />
    )
    const img = screen.getByAltText("Classic Stripe") as HTMLImageElement
    expect(img.src).toContain("example.com")
  })
})
