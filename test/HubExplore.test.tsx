import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HUB_SECTIONS, HubExplore } from "@/components/gts-hub/HubExplore"
import { HubSection } from "@/components/home/HubSection"
import type { HubSectionImage } from "@/lib/hub-section-image-types"
import type { Platform } from "@/lib/platform-types"

const IMAGES: HubSectionImage[] = [
  { _id: "1", sectionKey: "new-arrivals", desktopImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/new.png" },
]
const PLATFORMS: Platform[] = [
  {
    _id: "p1",
    name: "Instagram",
    slug: "instagram",
    url: "https://www.instagram.com/goalthalisports7",
    order: 0,
    status: "published",
    createdAt: "",
    updatedAt: "",
  },
]

describe("HubExplore", () => {
  it("shows every GTS Hub section - not just Our Work - with its link", () => {
    render(<HubExplore sectionImages={IMAGES} platforms={PLATFORMS} />)
    for (const section of HUB_SECTIONS) {
      const heading = screen.getByRole("heading", { name: section.title, level: 2 })
      expect(heading.closest("a")).toHaveAttribute("href", section.href)
    }
    expect(screen.getByRole("heading", { name: "New Arrivals" }).closest("a")!.querySelector("img")).not.toBeNull()
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute("href", "https://www.instagram.com/goalthalisports7")
  })

  it("is the same experience on the homepage, under its own section heading", () => {
    render(<HubSection sectionImages={IMAGES} platforms={PLATFORMS} />)
    const section = screen.getByRole("region", { name: "Explore the world of GTS" })
    expect(within(section).getByRole("link", { name: /open the gts hub/i })).toHaveAttribute("href", "/gts-hub")
    for (const section of HUB_SECTIONS) {
      expect(screen.getByRole("heading", { name: section.title, level: 3 })).toBeInTheDocument()
    }
    expect(screen.getByText("Everything GTS, connected")).toBeInTheDocument()
  })
})
