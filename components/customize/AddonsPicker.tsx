"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import type { Addon } from "@/lib/types"
import type { AddonSelection } from "@/lib/pricing"

interface AddonsPickerProps {
  addons: Addon[]
  currency: string
  selections: AddonSelection[]
  onChange: (selections: AddonSelection[]) => void
}

export function AddonsPicker({ addons, currency, selections, onChange }: AddonsPickerProps) {
  const [previewAddonId, setPreviewAddonId] = useState<string | null>(null)
  // Which addon's style/quantity picker is currently expanded - collapsed by
  // default so the list reads as a compact dropdown-style menu instead of
  // always showing every option for every addon.
  const [openAddonId, setOpenAddonId] = useState<string | null>(null)

  const getSelection = (addonId: string) => selections.find((s) => s.addonId === addonId) ?? null

  function selectStyle(addonId: string, styleId: string) {
    const existing = getSelection(addonId)
    const rest = selections.filter((s) => s.addonId !== addonId)
    onChange([...rest, { addonId, styleId, quantity: existing?.quantity || 1 }])
  }

  function setQuantity(addonId: string, quantity: number) {
    const clamped = Math.max(0, quantity)
    const existing = getSelection(addonId)
    if (!existing) return
    const rest = selections.filter((s) => s.addonId !== addonId)
    onChange(clamped > 0 ? [...rest, { ...existing, quantity: clamped }] : rest)
  }

  function clearAddon(addonId: string) {
    onChange(selections.filter((s) => s.addonId !== addonId))
  }

  const previewAddon = addons.find((a) => a.id === previewAddonId) ?? null

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-white">Addons</legend>

      {addons.map((addon) => {
        const selection = getSelection(addon.id)
        const isOpen = openAddonId === addon.id
        const selectedStyle = selection ? addon.styles.find((s) => s.id === selection.styleId) : null
        return (
          <div
            key={addon.id}
            className="glass-2 flex flex-col rounded-[var(--radius-md)]"
          >
            <button
              type="button"
              onClick={() => setOpenAddonId(isOpen ? null : addon.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold text-white">{addon.name}</span>
                {selectedStyle && (
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-brand-green)]">
                    {selectedStyle.label} × {selection?.quantity}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-[var(--color-text-gray)] transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] p-4 pt-3">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewAddonId(addon.id)}
                    className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
                  >
                    Preview styles →
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {addon.styles.map((style) => {
                    const isSelected = selection?.styleId === style.id
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => selectStyle(addon.id, style.id)}
                        aria-pressed={isSelected}
                        className={`rounded-[var(--radius-sm)] border px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10"
                            : "border-[var(--glass-border)] hover:border-gray-500"
                        }`}
                      >
                        <span className="block font-semibold text-white">{style.label}</span>
                        <span className="block text-[var(--color-text-gray)]">
                          {currency}
                          {style.price} each
                        </span>
                      </button>
                    )
                  })}
                </div>

                {selection && (
                  <div className="flex items-center gap-3">
                    <label htmlFor={`${addon.id}-qty`} className="text-xs text-[var(--color-text-gray)]">
                      Quantity
                    </label>
                    <input
                      id={`${addon.id}-qty`}
                      type="number"
                      min={1}
                      value={selection.quantity}
                      onChange={(e) => setQuantity(addon.id, Number(e.target.value))}
                      className="w-20 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-2 py-1 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => clearAddon(addon.id)}
                      className="text-xs text-[var(--color-error-red)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {previewAddon && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${previewAddon.name} style preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewAddonId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-3 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-lg)] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{previewAddon.name} styles</h2>
              <button
                type="button"
                onClick={() => setPreviewAddonId(null)}
                aria-label="Close preview"
                className="text-[var(--color-text-gray)] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {previewAddon.styles.map((style) => (
                <div
                  key={style.id}
                  className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-3"
                >
                  {style.imageUrl ? (
                    <Image
                      src={style.imageUrl}
                      alt={style.label}
                      width={200}
                      height={200}
                      className="aspect-square w-full rounded-[var(--radius-sm)] object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-gray-600 text-xs text-gray-500">
                      No image yet
                    </div>
                  )}
                  <span className="font-semibold text-white">{style.label}</span>
                  {style.description && (
                    <p className="text-xs text-[var(--color-text-gray)]">{style.description}</p>
                  )}
                  <span className="text-sm font-bold text-[var(--color-brand-green)]">
                    {currency}
                    {style.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </fieldset>
  )
}
