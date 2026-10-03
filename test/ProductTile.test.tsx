import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProductTile, productGridClass, splitProductName } from "@/components/products/ProductTile"
import type { ProductCard } from "@/lib/catalog"

const DESKTOP = "https://res.cloudinary.com/demo/image/upload/v1/hoodie-desktop.png"
const MOBILE = "https://res.cloudinary.com/demo/image/upload/v1/hoodie-mobile.png"

const hoodie: ProductCard = {
  _id: "1",
  name: "Hoodie Custom Designed",
  category: "Hoodie  custom designed",
  href: "/customize/Hoodie%20%20custom%20designed",
  thumbnailImageUrl: DESKTOP,
  thumbnailImageUrlMobile: MOBILE,
  description: "hoodie",
}

describe("splitProductName", () => {
  it("leads with the product and keeps the 'Custom Designed' label", () => {
    expect(splitProductName("Hoodie Custom Designed")).toEqual({ name: "Hoodie", label: "Custom Designed" })
    expect(splitProductName("Track-suit Custom Designed")).toEqual({ name: "Track-suit", label: "Custom Designed" })
    expect(splitProductName("Jersey Kit")).toEqual({ name: "Jersey Kit" })
  })
})

describe("ProductTile", () => {
  it("links to the product's customizer with a readable name and the full name for screen readers", () => {
    render(<ProductTile item={hoodie} />)
    expect(screen.getByRole("heading", { name: "Hoodie Custom Designed" })).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveAttribute("href", "/customize/Hoodie%20%20custom%20designed")
    // A placeholder-length admin description isn't shown.
    expect(screen.queryByText("hoodie")).not.toBeInTheDocument()
    expect(screen.getByText("Made to order with your team's design.")).toBeInTheDocument()
  })

  it("serves the mobile crop to phones and the desktop crop to larger screens, in one <picture>", () => {
    const { container } = render(<ProductTile item={hoodie} />)
    const picture = container.querySelector("picture")
    expect(picture).not.toBeNull()
    const source = picture!.querySelector("source")!
    expect(source.getAttribute("media")).toBe("(min-width: 640px)")
    expect(source.getAttribute("srcset")).toContain(encodeURIComponent(DESKTOP))
    const img = picture!.querySelector("img")!
    expect(img.getAttribute("srcset")).toContain(encodeURIComponent(MOBILE))
    expect(img.getAttribute("srcset")).not.toContain(encodeURIComponent(DESKTOP))
    expect(container.querySelectorAll("img")).toHaveLength(1)
  })

  it("uses a single image when there's no separate mobile crop (or it's the same URL)", () => {
    const { container } = render(<ProductTile item={{ ...hoodie, thumbnailImageUrlMobile: DESKTOP }} />)
    expect(container.querySelector("picture")).toBeNull()
    expect(container.querySelectorAll("img")).toHaveLength(1)
  })

  it("lays out three products in three columns rather than leaving a gap", () => {
    expect(productGridClass(3)).toContain("sm:grid-cols-3")
    expect(productGridClass(3)).not.toContain("grid-cols-4")
    expect(productGridClass(4)).toContain("lg:grid-cols-4")
  })
})
