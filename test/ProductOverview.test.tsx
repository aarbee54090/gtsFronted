import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ProductOverview } from "@/components/customize/ProductOverview"
import { lowestPrice, priceSummary, productPageCopy } from "@/lib/product-seo"

const football = productPageCopy({ name: "Football Custom Design jersey", category: "Jerseys Custom Designed", sport: "Football" })
const tiers = [
  { minQty: 1, maxQty: 2, price: 2000 },
  { minQty: 151, maxQty: 350, price: 900 },
]

describe("ProductOverview", () => {
  it("starts with every topic collapsed, showing a one-line summary", () => {
    const { container } = render(
      <ProductOverview
        copy={football}
        designCount={23}
        fromPrice={lowestPrice(tiers)}
        prices={priceSummary(tiers)}
        related={[{ href: "/gts-hub/portfolio/rayzrs", label: "Team RAYZRS" }]}
      />
    )
    const topics = container.querySelectorAll("details")
    expect(topics).toHaveLength(4)
    topics.forEach((topic) => expect(topic).not.toHaveAttribute("open"))
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Football jerseys, made for your team")
    expect(screen.getByText("From Rs 900 per piece")).toBeInTheDocument()
  })

  it("keeps the full details in the page for search engines", () => {
    render(
      <ProductOverview copy={football} designCount={23} fromPrice={lowestPrice(tiers)} prices={priceSummary(tiers)} related={[]} />
    )
    expect(screen.getByText("One of our 23 football jersey designs, or your own artwork")).toBeInTheDocument()
    expect(screen.getByText(/deliver anywhere in Nepal/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /all kits we've made/i })).toHaveAttribute("href", "/gts-hub/portfolio")
  })

  it("doesn't promise a live price for products quoted per order", () => {
    const hoodie = productPageCopy({ name: "Hoodie Custom Design", category: "Hoodie custom designed", sport: "Hoodie" })
    const { container } = render(<ProductOverview copy={hoodie} designCount={0} fromPrice={null} prices={null} related={[]} />)
    expect(screen.getByText("Quoted per order on WhatsApp")).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/price updates as you go/)
    expect(container.textContent).not.toMatch(/shorts/i)
  })
})
