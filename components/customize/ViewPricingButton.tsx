"use client"

import { useState } from "react"
import Image from "next/image"
import { Tag, X } from "lucide-react"

import type { Design, PricingTier } from "@/lib/types"

interface ViewPricingButtonProps {
  designs: Design[]
  pricingTiers: PricingTier[]
  currency: string
}

function tierLabel(tier: PricingTier): string {
  return tier.maxQty === null ? `${tier.minQty}+ pcs` : `${tier.minQty}-${tier.maxQty} pcs`
}

export function ViewPricingButton({ designs, pricingTiers, currency }: ViewPricingButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
      >
        <Tag className="h-4 w-4" />
        View Pricing
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pricing"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-3 flex max-h-[80vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-[var(--radius-lg)] p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Pricing</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close pricing"
                className="text-[var(--color-text-gray)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {pricingTiers.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
                  Price by Quantity
                </h3>
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--glass-border)] px-3 py-2"
                  >
                    <span className="text-sm text-white">{tierLabel(tier)}</span>
                    <span className="text-sm font-bold text-[var(--color-brand-green)]">
                      {currency}
                      {tier.price} / pc
                    </span>
                  </div>
                ))}
              </div>
            )}

            {designs.some((d) => !!d.price) && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
                  Price by Design
                </h3>
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      {design.imageUrl && (
                        <Image
                          src={design.imageUrl}
                          alt={design.name}
                          width={40}
                          height={52}
                          className="h-13 w-10 rounded-[var(--radius-sm)] object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-white">{design.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-brand-green)]">
                      {currency}
                      {design.price ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {pricingTiers.length === 0 && !designs.some((d) => !!d.price) && (
              <p className="text-sm text-[var(--color-text-gray)]">
                No pricing has been set for this product yet.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
