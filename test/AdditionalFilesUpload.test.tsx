import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { AdditionalFilesUpload } from "@/components/customize/AdditionalFilesUpload"

describe("AdditionalFilesUpload", () => {
  it("shows no file list when nothing has been uploaded yet", () => {
    render(<AdditionalFilesUpload files={[]} onChange={vi.fn()} />)
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument()
  })

  it("adds a selected file to the list", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AdditionalFilesUpload files={[]} onChange={onChange} />)

    const file = new File(["fake-logo"], "team-logo.png", { type: "image/png" })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(onChange).toHaveBeenCalledWith([file])
  })

  it("appends new files to existing ones rather than replacing them", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const existing = new File(["a"], "sponsor-a.png", { type: "image/png" })
    render(<AdditionalFilesUpload files={[existing]} onChange={onChange} />)

    const file = new File(["b"], "sponsor-b.png", { type: "image/png" })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(onChange).toHaveBeenCalledWith([existing, file])
  })

  it("lists every uploaded file by name", () => {
    const files = [
      new File(["a"], "logo.png", { type: "image/png" }),
      new File(["b"], "sponsor.png", { type: "image/png" }),
    ]
    render(<AdditionalFilesUpload files={files} onChange={vi.fn()} />)
    expect(screen.getByText("logo.png")).toBeInTheDocument()
    expect(screen.getByText("sponsor.png")).toBeInTheDocument()
  })

  it("removes a file when its remove button is clicked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const files = [
      new File(["a"], "logo.png", { type: "image/png" }),
      new File(["b"], "sponsor.png", { type: "image/png" }),
    ]
    render(<AdditionalFilesUpload files={files} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: /remove logo.png/i }))

    expect(onChange).toHaveBeenCalledWith([files[1]])
  })

  it("accepts multiple files in a single selection", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AdditionalFilesUpload files={[]} onChange={onChange} />)

    const fileA = new File(["a"], "a.png", { type: "image/png" })
    const fileB = new File(["b"], "b.png", { type: "image/png" })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, [fileA, fileB])

    expect(onChange).toHaveBeenCalledWith([fileA, fileB])
  })
})
