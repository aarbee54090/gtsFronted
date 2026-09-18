import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { DesignPicker } from "@/components/customize/DesignPicker"
import type { Design } from "@/lib/types"

const designs: Design[] = [
  { id: "d1", name: "Design One", sport: "Football" },
  { id: "d2", name: "Design Two", sport: "Football" },
  { id: "d3", name: "Design Three", sport: "Football" },
]

const designsWithImages: Design[] = [
  { id: "d1", name: "Design One", sport: "Football", imageUrl: "https://example.com/one.png" },
]

const categoryId = "test-category"
const sportSlug = "football"

describe("DesignPicker", () => {
  it("shows a Cloudinary-pending placeholder when a design has no imageUrl", () => {
    render(
      <DesignPicker
        designs={designs}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(screen.getAllByText(/pending upload/i).length).toBeGreaterThan(0)
  })

  it("paginates designs and shows a page indicator when there are more than one page", () => {
    render(
      <DesignPicker
        designs={designs}
        selectedId={null}
        onSelect={vi.fn()}
        pageSize={2}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(screen.getByText("Design One")).toBeInTheDocument()
    expect(screen.getByText("Design Two")).toBeInTheDocument()
    expect(screen.queryByText("Design Three")).not.toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
  })

  it("navigates to the next page and reveals the remaining design", async () => {
    const user = userEvent.setup()
    render(
      <DesignPicker
        designs={designs}
        selectedId={null}
        onSelect={vi.fn()}
        pageSize={2}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )

    await user.click(screen.getByRole("button", { name: /next page/i }))

    expect(screen.getByText("Design Three")).toBeInTheDocument()
    expect(screen.queryByText("Design One")).not.toBeInTheDocument()
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })

  it("does not show pagination controls when everything fits on one page", () => {
    render(
      <DesignPicker
        designs={designs}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(screen.queryByText(/page \d of \d/i)).not.toBeInTheDocument()
  })

  it("defaults to showing 10 designs per page", () => {
    const manyDesigns: Design[] = Array.from({ length: 15 }, (_, i) => ({
      id: `d${i}`,
      name: `Design ${i}`,
      sport: "Football",
    }))
    render(
      <DesignPicker
        designs={manyDesigns}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
    expect(screen.getByText("Design 0")).toBeInTheDocument()
    expect(screen.getByText("Design 9")).toBeInTheDocument()
    expect(screen.queryByText("Design 10")).not.toBeInTheDocument()
  })

  it("renders the upload-your-own-design option", () => {
    render(
      <DesignPicker
        designs={designs}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(
      screen.getByRole("button", { name: /upload own design/i })
    ).toBeInTheDocument()
  })

  it("shows preview and download icon buttons only for designs with a real image", () => {
    render(
      <DesignPicker
        designs={designsWithImages}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(screen.getByRole("button", { name: /preview design one full size/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /download design one/i })).toBeInTheDocument()
  })

  it("does not show preview/download icons for a design with no image yet", () => {
    render(
      <DesignPicker
        designs={designs}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )
    expect(screen.queryByRole("button", { name: /preview .* full size/i })).not.toBeInTheDocument()
  })

  it("opens a lightbox with the full image when the preview icon is clicked", async () => {
    const user = userEvent.setup()
    render(
      <DesignPicker
        designs={designsWithImages}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )

    await user.click(screen.getByRole("button", { name: /preview design one full size/i }))

    expect(screen.getByRole("dialog", { name: /design one full preview/i })).toBeInTheDocument()
  })

  it("closes the lightbox when the close button is clicked", async () => {
    const user = userEvent.setup()
    render(
      <DesignPicker
        designs={designsWithImages}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )

    await user.click(screen.getByRole("button", { name: /preview design one full size/i }))
    await user.click(screen.getByRole("button", { name: /close preview/i }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("clicking the preview/download icons does not select the design", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <DesignPicker
        designs={designsWithImages}
        selectedId={null}
        onSelect={onSelect}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )

    await user.click(screen.getByRole("button", { name: /preview design one full size/i }))

    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe("DesignPicker - uploaded file preview", () => {
  it("shows an actual image thumbnail for the uploaded file, not just text", async () => {
    const user = userEvent.setup()
    const file = new File(["fake-image-content"], "my-design.png", { type: "image/png" })

    render(
      <DesignPicker
        designs={[]}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(screen.getByAltText("my-design.png")).toBeInTheDocument()
    expect(screen.getByText("my-design.png")).toBeInTheDocument()
  })

  it("lets the customer remove the uploaded file", async () => {
    const user = userEvent.setup()
    const file = new File(["fake-image-content"], "my-design.png", { type: "image/png" })

    render(
      <DesignPicker
        designs={[]}
        selectedId={null}
        onSelect={vi.fn()}
        categoryId={categoryId}
        sportSlug={sportSlug}
      />
    )

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)
    await user.click(screen.getByRole("button", { name: /remove uploaded design/i }))

    expect(screen.queryByAltText("my-design.png")).not.toBeInTheDocument()
  })
})
