"use client"

import type { ConfigField, ConfigFieldValue } from "@/lib/types"

export type { ConfigFieldValue }

interface ConfigFieldInputProps {
  field: ConfigField
  value: ConfigFieldValue | undefined
  onChange: (key: string, value: ConfigFieldValue) => void
  /**
   * For quantity_per_variant fields only: the order's total quantity. Each
   * option here is an opt-in upgrade ("N of my total pieces get this"), so
   * the sum across all of this field's options is capped at this value -
   * whatever's left over implicitly stays default/no-charge.
   */
  maxTotal?: number
}

const inputClasses =
  "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

export function ConfigFieldInput({ field, value, onChange, maxTotal }: ConfigFieldInputProps) {
  if (field.type === "select") {
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-white">
          {field.label}
          {field.required && <span className="ml-1 text-[var(--color-error-red)]">*</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const selected = value === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(field.key, option)}
                aria-pressed={selected}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-white"
                    : "border-[var(--glass-border)] text-[var(--color-text-gray)] hover:border-gray-500"
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </fieldset>
    )
  }

  if (field.type === "text") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={field.key} className="text-sm font-semibold text-white">
          {field.label}
          {field.required && <span className="ml-1 text-[var(--color-error-red)]">*</span>}
        </label>
        <input
          id={field.key}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputClasses}
        />
      </div>
    )
  }

  if (field.type === "number") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={field.key} className="text-sm font-semibold text-white">
          {field.label}
          {field.required && <span className="ml-1 text-[var(--color-error-red)]">*</span>}
        </label>
        <input
          id={field.key}
          type="number"
          min={0}
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          className={`w-32 ${inputClasses}`}
        />
      </div>
    )
  }

  // quantity_per_variant: one numeric input per option. Each option is an
  // opt-in upgrade capped so the field's total across options never
  // exceeds maxTotal (the order's total quantity) - the rest is implicitly
  // default/no-charge, not tracked here.
  const variantValues: Record<string, number> =
    value && typeof value === "object" ? (value as Record<string, number>) : {}

  const usedAcrossField = Object.values(variantValues).reduce((sum, n) => sum + (Number(n) || 0), 0)

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-white">
        {field.label}
        {field.required && <span className="ml-1 text-[var(--color-error-red)]">*</span>}
      </legend>
      <div className="flex flex-wrap gap-4">
        {field.options?.map((option) => {
          const optionPrice = field.optionPrices?.[option]
          const currentValue = variantValues[option] || 0
          // Remaining headroom for this option = total minus whatever's
          // already allocated to the OTHER options in this same field.
          const usedByOthers = usedAcrossField - currentValue
          const maxForOption =
            typeof maxTotal === "number" ? Math.max(0, maxTotal - usedByOthers) : undefined
          return (
            <div key={option} className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <label htmlFor={`${field.key}-${option}`} className="text-xs text-[var(--color-text-gray)]">
                  {option}
                </label>
                {!!optionPrice && (
                  <span className="text-xs font-semibold text-[var(--color-brand-green)]">
                    (+₹{optionPrice}/pc)
                  </span>
                )}
              </div>
              <input
                id={`${field.key}-${option}`}
                type="number"
                min={0}
                max={maxForOption}
                value={variantValues[option] || ""}
                onChange={(e) => {
                  const raw = Math.max(0, Number(e.target.value))
                  const clamped = typeof maxForOption === "number" ? Math.min(raw, maxForOption) : raw
                  onChange(field.key, {
                    ...variantValues,
                    [option]: clamped,
                  })
                }}
                className={`w-24 ${inputClasses}`}
              />
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export function sumVariantQuantity(value: ConfigFieldValue | undefined): number {
  if (!value || typeof value !== "object") return 0
  return Object.values(value).reduce((sum, n) => sum + (Number(n) || 0), 0)
}
