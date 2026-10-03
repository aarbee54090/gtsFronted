import { useState } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach } from "vitest"
import { AddonsPicker } from "@/components/customize/AddonsPicker"
import { groupAddonsByName } from "@/lib/addon-groups"
import type { Addon } from "@/lib/types"
import type { AddonSelection } from "@/lib/pricing"

// Mirrors the live data that prompted the redesign: two separate addons both
// named "Shorts", one style each, plus a Track addon.
const addons: Addon[] = [
  {
    id: "a1",
    name: "Shorts",
    styles: [
      {
        id: "s1",
        label: "number print on shorts",
        price: 260,
        description: "number print on shorts dtf print.",
        imageUrl: "https://res.cloudinary.com/demo/shorts.png",
      },
    ],
  },
  { id: "a2", name: " shorts ", styles: [{ id: "s2", label: "strips on shorts", price: 300 }] },
  { id: "a3", name: "Track", styles: [{ id: "t1", label: "Normal", price: 500 }] },
]

let latest: AddonSelection[] = []
beforeEach(() => {
  latest = []
})

function Harness() {
  const [selections, setSelections] = useState<AddonSelection[]>([])
  function handleChange(next: AddonSelection[]) {
    latest = next
    setSelections(next)
  }
  return <AddonsPicker addons={addons} currency="Rs" selections={selections} onChange={handleChange} />
}

describe("groupAddonsByName", () => {
  it("merges addons with the same name (trimmed, case-insensitive), keeping each item's own addon id", () => {
    const groups = groupAddonsByName(addons)
    expect(groups.map((g) => g.name)).toEqual(["Shorts", "Track"])
    expect(groups[0].items.map((i) => [i.addonId, i.style.id])).toEqual([
      ["a1", "s1"],
      ["a2", "s2"],
    ])
  })
})

describe("AddonsPicker", () => {
  it("starts with one collapsed row per addon type - same-name addons merged - and no items listed", () => {
    render(<Harness />)
    expect(screen.getByRole("heading", { name: "Addons (optional)" })).toBeInTheDocument()
    const shorts = screen.getAllByRole("button", { name: /^shorts/i })
    expect(shorts).toHaveLength(1)
    expect(shorts[0]).toHaveAttribute("aria-expanded", "false")
    expect(shorts[0]).toHaveTextContent("2 styles · from Rs 260")
    expect(screen.getByRole("button", { name: /^track/i })).toHaveTextContent("1 style · Rs 500")
    expect(screen.queryByText("number print on shorts")).not.toBeInTheDocument()
  })

  it("lists a type's items, with description and price, when its row is tapped", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: /^shorts/i }))
    expect(screen.getByRole("button", { name: /^shorts/i })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("number print on shorts")).toBeInTheDocument()
    expect(screen.getByText("strips on shorts")).toBeInTheDocument()
    expect(screen.getByText("number print on shorts dtf print.")).toBeInTheDocument()
    expect(within(screen.getByRole("list")).getByText(/Rs 260/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^shorts/i }))
    expect(screen.queryByText("number print on shorts")).not.toBeInTheDocument()
  })

  it("keeps only one type open, and a closed type still shows what was added", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: /^shorts/i }))
    await user.click(screen.getByRole("button", { name: "Add Shorts: strips on shorts" }))
    await user.click(screen.getByRole("button", { name: /^track/i }))

    expect(screen.queryByText("strips on shorts")).not.toBeInTheDocument()
    expect(screen.getByText("Normal")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^shorts/i })).toHaveTextContent("1 pc · Rs 300")
  })

  it("adds items independently, each with its own quantity", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: /^shorts/i }))
    await user.click(screen.getByRole("button", { name: "Add Shorts: number print on shorts" }))
    await user.click(screen.getByRole("button", { name: "Add Shorts: strips on shorts" }))
    await user.click(screen.getByRole("button", { name: "One more Shorts: strips on shorts" }))

    expect(latest).toEqual([
      { addonId: "a1", styleId: "s1", quantity: 1 },
      { addonId: "a2", styleId: "s2", quantity: 2 },
    ])
    expect(screen.getByText(/3 pcs added · Rs 860/)).toBeInTheDocument()
  })

  it("lets the quantity be typed, and removes the item when stepped below one", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: /^track/i }))
    await user.click(screen.getByRole("button", { name: "Add Track: Normal" }))
    const qty = screen.getByRole("textbox", { name: "Track: Normal quantity" })
    await user.clear(qty)
    // Clearing the field mid-edit must not drop the item.
    expect(latest).toEqual([{ addonId: "a3", styleId: "t1", quantity: 1 }])
    await user.type(qty, "15")
    expect(latest).toEqual([{ addonId: "a3", styleId: "t1", quantity: 15 }])

    await user.clear(qty)
    await user.type(qty, "1")
    await user.click(screen.getByRole("button", { name: "Remove Track: Normal" }))
    expect(latest).toEqual([])
    expect(screen.getByRole("button", { name: "Add Track: Normal" })).toBeInTheDocument()
  })

  it("opens the preview outside the card (portalled to body) and closes on Escape", async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)

    await user.click(screen.getByRole("button", { name: /^shorts/i }))
    await user.click(screen.getByRole("button", { name: "Preview Shorts: number print on shorts" }))
    const dialog = screen.getByRole("dialog", { name: "number print on shorts" })
    expect(container.contains(dialog)).toBe(false)
    expect(within(dialog).getByText("number print on shorts dtf print.")).toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Add Shorts: number print on shorts" }))
    expect(latest).toEqual([{ addonId: "a1", styleId: "s1", quantity: 1 }])

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
