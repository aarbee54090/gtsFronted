import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SeoFieldsEditor } from "@/components/admin/gts-hub/SeoFieldsEditor"

const noop = () => {}

// The live CMS had a slug, a keyword list, and a Cloudinary collection page
// saved as OG images - the editor now flags values the site will ignore.
describe("SeoFieldsEditor OG image warning", () => {
  it.each([
    "team-rayzrs-football-jersey-shorts",
    "custom jersey Nepal, sports jersey Nepal, football jersey Nepal",
    "https://collection.cloudinary.com/dtgh5unm5/8a1f2d9c9e293d417bb4a112c254b4fa",
  ])("warns when the OG image isn't an image URL: %s", (ogImage) => {
    render(<SeoFieldsEditor value={{ ogImage }} onChange={noop} />)
    expect(screen.getByText(/isn't an image URL/i)).toBeInTheDocument()
  })

  it.each([
    "",
    "https://res.cloudinary.com/dtgh5unm5/image/upload/v1790586771/11_ehydda.png",
    "https://example.com/share.jpg",
  ])("stays quiet for a blank value or a real image URL: %s", (ogImage) => {
    render(<SeoFieldsEditor value={{ ogImage }} onChange={noop} />)
    expect(screen.queryByText(/isn't an image URL/i)).not.toBeInTheDocument()
  })
})
