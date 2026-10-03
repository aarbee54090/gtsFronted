"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ChevronDown, Maximize2, Minus, Plus, Shirt, Trash2, X } from "lucide-react"
import type { Addon } from "@/lib/types"
import type { AddonSelection } from "@/lib/pricing"
import { groupAddonsByName, type AddonItem } from "@/lib/addon-groups"
import { formatMoney } from "@/lib/money"

interface AddonsPickerProps {
  addons: Addon[]
  currency: string
  selections: AddonSelection[]
  onChange: (selections: AddonSelection[]) => void
}

const isSame = (sel: AddonSelection, item: AddonItem) => sel.addonId === item.addonId && sel.styleId === item.style.id

// One "Addons" section with a collapsed row per addon type (Shorts, Track).
// Tapping a row opens that type's styles; only one type is open at a time
// so the list never fills the screen. Each style is picked independently
// with its own quantity (e.g. 10 "Number print" shorts and 5 plain ones).
export function AddonsPicker({ addons, currency, selections, onChange }: AddonsPickerProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ groupName: string; item: AddonItem } | null>(null)
  const closePreview = useCallback(() => setPreview(null), [])
  const idPrefix = useId()
  const groups = groupAddonsByName(addons)

  const quantityOf = (item: AddonItem) => selections.find((s) => isSame(s, item))?.quantity ?? 0

  // Updates in place so the order of addon lines on the quotation doesn't
  // shuffle every time a quantity changes.
  function setQuantity(item: AddonItem, quantity: number) {
    const next = Math.max(0, Math.floor(quantity) || 0)
    if (next === 0) {
      onChange(selections.filter((s) => !isSame(s, item)))
    } else if (selections.some((s) => isSame(s, item))) {
      onChange(selections.map((s) => (isSame(s, item) ? { ...s, quantity: next } : s)))
    } else {
      onChange([...selections, { addonId: item.addonId, styleId: item.style.id, quantity: next }])
    }
  }

  // Opening a type below an open one collapses the one above, which can
  // pull the tapped row up under the navbar - bring it back into view.
  useEffect(() => {
    if (openGroup === null) return
    const index = groups.findIndex((g) => g.name === openGroup)
    document.getElementById(`${idPrefix}-group-${index}`)?.scrollIntoView?.({ block: "nearest", behavior: "smooth" })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when a different type is opened
  }, [openGroup])

  const piecesOf = (items: AddonItem[]) => items.reduce((sum, item) => sum + quantityOf(item), 0)
  const totalOf = (items: AddonItem[]) => items.reduce((sum, item) => sum + item.style.price * quantityOf(item), 0)
  const allItems = groups.flatMap((g) => g.items)
  const selectedPieces = piecesOf(allItems)

  return (
    <section aria-labelledby="addons-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="addons-heading" className="text-sm font-semibold text-white">
          Addons (optional)
        </h2>
        {selectedPieces > 0 && (
          <span className="text-xs font-semibold text-[var(--color-brand-green)]">
            {selectedPieces} {selectedPieces === 1 ? "pc" : "pcs"} added · {formatMoney(currency, totalOf(allItems))}
          </span>
        )}
      </div>

      {groups.map((group, index) => {
        const isOpen = openGroup === group.name
        const panelId = `${idPrefix}-panel-${index}`
        const prices = group.items.map((i) => i.style.price)
        const minPrice = Math.min(...prices)
        const samePrice = prices.every((p) => p === minPrice)
        const groupPieces = piecesOf(group.items)
        return (
          <div key={group.name} className="glass-2 flex flex-col rounded-[var(--radius-md)]">
            <button
              id={`${idPrefix}-group-${index}`}
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : group.name)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full scroll-mt-28 items-center gap-3 p-4 text-left"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="break-words font-semibold text-white">{group.name}</span>
                <span className="text-xs text-[var(--color-text-gray)]">
                  {group.items.length} {group.items.length === 1 ? "style" : "styles"} · {samePrice ? "" : "from "}
                  {formatMoney(currency, minPrice)}
                </span>
              </span>
              {groupPieces > 0 && (
                <span className="flex-shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-green)]">
                  {groupPieces} {groupPieces === 1 ? "pc" : "pcs"} · {formatMoney(currency, totalOf(group.items))}
                </span>
              )}
              <ChevronDown
                aria-hidden="true"
                className={`h-5 w-5 flex-shrink-0 text-[var(--color-text-gray)] transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <ul id={panelId} className="divide-y divide-[var(--glass-border)] border-t border-[var(--glass-border)]">
                {group.items.map((item) => {
                  const quantity = quantityOf(item)
                  const { style } = item
                  const itemName = `${group.name}: ${style.label}`
                  return (
                    <li
                      key={`${item.addonId}-${style.id}`}
                      className={`flex items-start gap-3 px-3 py-3 transition-colors sm:items-center sm:px-4 ${
                        quantity > 0 ? "bg-[var(--color-brand-green)]/5" : ""
                      }`}
                    >
                      {style.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreview({ groupName: group.name, item })}
                          aria-label={`Preview ${itemName}`}
                          className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-white"
                        >
                          <Image src={style.imageUrl} alt="" width={112} height={112} className="h-full w-full object-cover" />
                          <span className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-white">
                            <Maximize2 className="h-3 w-3" aria-hidden="true" />
                          </span>
                        </button>
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--glass-border)] text-[var(--color-text-gray)]">
                          <Shirt className="h-5 w-5" aria-hidden="true" />
                        </div>
                      )}

                      {/* Phones: name, description, then price + Add on one line. Wider: all on one row. */}
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold leading-snug text-white">{style.label}</p>
                          {style.description && (
                            <p className="mt-0.5 break-words text-xs leading-snug text-[var(--color-text-gray)]">
                              {style.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-shrink-0 sm:flex-nowrap sm:gap-4">
                          <span className="text-sm font-bold text-[var(--color-brand-green)]">
                            {formatMoney(currency, style.price)}
                            <span className="text-xs font-normal text-[var(--color-text-gray)]">/pc</span>
                          </span>
                          {/* Fixed slot on wider screens so prices line up whether a row shows Add or the stepper. */}
                          <div className="flex justify-end sm:w-[6.5rem]">
                            <AddonQuantityControl
                              itemName={itemName}
                              quantity={quantity}
                              onChange={(q) => setQuantity(item, q)}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}

      {preview && (
        <AddonPreview
          groupName={preview.groupName}
          item={preview.item}
          currency={currency}
          quantity={quantityOf(preview.item)}
          onQuantityChange={(q) => setQuantity(preview.item, q)}
          onClose={closePreview}
        />
      )}
    </section>
  )
}

interface AddonQuantityControlProps {
  itemName: string
  quantity: number
  onChange: (quantity: number) => void
}

// "Add" until picked, then a −/qty/+ stepper. The typed value is held as a
// draft while the field is focused so clearing it to type "15" doesn't
// remove the item mid-edit; an empty or zero entry snaps back on blur.
function AddonQuantityControl({ itemName, quantity, onChange }: AddonQuantityControlProps) {
  const [draft, setDraft] = useState<string | null>(null)

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label={`Add ${itemName}`}
        className="ml-auto flex h-9 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--color-brand-green)] px-4 text-xs font-bold text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-brand-green)] hover:text-[var(--color-bg-dark)]"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add
      </button>
    )
  }

  return (
    <div className="ml-auto flex h-9 items-center rounded-[var(--radius-pill)] border border-[var(--color-brand-green)] bg-black/20">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${itemName}` : `One less ${itemName}`}
        className="flex h-9 w-8 items-center justify-center text-white hover:text-[var(--color-brand-green)]"
      >
        {quantity === 1 ? <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={`${itemName} quantity`}
        value={draft ?? String(quantity)}
        onFocus={(e) => {
          setDraft(String(quantity))
          e.target.select()
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
          setDraft(raw)
          const n = Number(raw)
          if (n > 0) onChange(n)
        }}
        onBlur={() => setDraft(null)}
        className="w-9 bg-transparent text-center text-sm font-bold text-white focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label={`One more ${itemName}`}
        className="flex h-9 w-8 items-center justify-center text-white hover:text-[var(--color-brand-green)]"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

interface AddonPreviewProps {
  groupName: string
  item: AddonItem
  currency: string
  quantity: number
  onQuantityChange: (quantity: number) => void
  onClose: () => void
}

// Portalled to <body>: the customizer's cards use backdrop-filter, which
// turns them into the containing block for `position: fixed` children - the
// old in-card modal was trapped inside its card, under the next card and the
// navbar. z-[60] keeps it above the navbar (z-50).
function AddonPreview({ groupName, item, currency, quantity, onQuantityChange, onClose }: AddonPreviewProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const { style } = item

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-3 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-lg)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-gray)]">{groupName}</p>
            <h2 id={titleId} className="break-words text-base font-bold text-white">
              {style.label}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="-mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-text-gray)] hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {style.imageUrl && (
            <div className="overflow-hidden rounded-[var(--radius-md)] bg-white">
              <Image
                src={style.imageUrl}
                alt={style.label}
                width={800}
                height={800}
                className="mx-auto max-h-[55dvh] w-full object-contain"
              />
            </div>
          )}
          {style.description && (
            <p className="mt-3 break-words text-sm leading-relaxed text-[var(--color-text-gray)]">{style.description}</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--glass-border)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <span className="text-lg font-bold text-[var(--color-brand-green)]">
            {formatMoney(currency, style.price)}
            <span className="text-xs font-normal text-[var(--color-text-gray)]">/pc</span>
          </span>
          <AddonQuantityControl itemName={`${groupName}: ${style.label}`} quantity={quantity} onChange={onQuantityChange} />
        </div>
      </div>
    </div>,
    document.body
  )
}
