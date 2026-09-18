import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { ConfigFieldInput, sumVariantQuantity, type ConfigFieldValue } from "@/components/customize/ConfigFieldInput"
import type { ConfigField } from "@/lib/types"

const sleeveField: ConfigField = {
  key: "sleeveType",
  label: "Sleeve Type",
  type: "quantity_per_variant",
  options: ["Full Sleeve", "Half Sleeve"],
  required: true,
}

// A small stateful wrapper, since ConfigFieldInput is a controlled component -
// this properly simulates a real parent re-rendering with the updated value
// after every keystroke, the same way Customizer.tsx actually uses it.
function ControlledHarness() {
  const [value, setValue] = useState<ConfigFieldValue | undefined>(undefined)
  return (
    <ConfigFieldInput
      field={sleeveField}
      value={value}
      onChange={(_key, newValue) => setValue(newValue)}
    />
  )
}

describe("ConfigFieldInput - quantity_per_variant", () => {
  it("shows an empty field, not a literal 0, when no value is set yet", () => {
    render(<ConfigFieldInput field={sleeveField} value={undefined} onChange={vi.fn()} />)
    const input = screen.getByLabelText("Full Sleeve") as HTMLInputElement
    expect(input.value).toBe("")
  })

  it("does not concatenate onto a leading zero when typing a fresh value", async () => {
    const user = userEvent.setup()
    render(<ControlledHarness />)
    const input = screen.getByLabelText("Full Sleeve") as HTMLInputElement

    await user.type(input, "45")

    // The real bug: typing "45" into a field showing literal "0" produced "045".
    expect(input.value).toBe("45")
  })

  it("sums correctly once a real value is typed", () => {
    expect(sumVariantQuantity({ "Full Sleeve": 45, "Half Sleeve": 0 })).toBe(45)
  })
})
