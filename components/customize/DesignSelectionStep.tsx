"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X } from "lucide-react"

import type { ProductDetail } from "@/lib/types"
import { saveUploadedDesignImage, clearUploadedDesignImage } from "@/lib/uploaded-design"
import { DesignPicker } from "./DesignPicker"
import { Card } from "./Card"

interface DesignSelectionStepProps {
  product: ProductDetail
  categoryId: string
  sportSlug: string
  /** From "?design=" - preselects a design, e.g. when resuming a saved design from the account area. */
  initialDesignId?: string
}

export function DesignSelectionStep({
  product,
  categoryId,
  sportSlug,
  initialDesignId,
}: DesignSelectionStepProps) {
  const router = useRouter()
  const [designId, setDesignId] = useState<string | null>(initialDesignId ?? null)
  // Kept alongside sessionStorage's copy so the mobile sticky bar has an
  // immediate thumbnail for a just-uploaded custom design.
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null)
  // Mobile-only "change design" overlay, opened from the sticky bar so users
  // who've scrolled past the grid don't have to scroll back up to change it.
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleUploadFile(file: File) {
    clearUploadedDesignImage()
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        saveUploadedDesignImage(reader.result)
        setUploadedPreviewUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Shared select handler for both the inline grid and the mobile overlay's
  // grid - picking a design also closes the overlay if it happens to be open.
  function handleSelect(id: string) {
    setDesignId(id)
    setPickerOpen(false)
  }

  const handleContinue = () => {
    if (!designId) return
    router.push(`/customize/${categoryId}/${sportSlug}/${encodeURIComponent(designId)}`)
  }

  const selectedDesign = useMemo(
    () => product.designs.find((d) => d.id === designId) ?? null,
    [product.designs, designId]
  )
  const isCustomUpload = designId === "custom-upload"
  const barThumbnail = selectedDesign?.imageUrl ?? (isCustomUpload ? uploadedPreviewUrl : null)
  const barName = selectedDesign?.name ?? (isCustomUpload ? "Your uploaded design" : "")

  return (
    <>
      {/* Extra bottom padding on mobile only, so the sticky bar never covers
          the last row of designs - desktop keeps its original spacing. */}
      <Card className="flex flex-col gap-8 p-8 pb-28 md:pb-8">
        <DesignPicker
          designs={product.designs}
          selectedId={designId}
          onSelect={handleSelect}
          onUploadFile={handleUploadFile}
          currency={product.currency}
          categoryId={categoryId}
          sportSlug={sportSlug}
        />

        {/* Desktop/tablet: original inline Continue bar, unchanged. Hidden on
            mobile in favor of the sticky bottom bar below. */}
        <div className="hidden items-center justify-between border-t border-[var(--glass-border)] pt-4 md:flex">
          <p className="text-xs text-[var(--color-text-gray)]">
            {designId
              ? "Design selected — continue to customize your kit."
              : "Choose a design or upload your own to continue."}
          </p>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!designId}
            className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      </Card>

      {/* Mobile: sticky bottom action bar, appears only once a design is
          selected so it's always reachable no matter how far the grid scrolls. */}
      {designId && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-brand-green)] bg-[var(--color-card-dark)]/95 px-4 pt-3 backdrop-blur-[16px] md:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20">
              {barThumbnail && (
                <Image
                  src={barThumbnail}
                  alt={barName}
                  width={48}
                  height={48}
                  unoptimized={isCustomUpload}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{barName}</p>
              <p className="text-[11px] text-[var(--color-text-gray)]">Selected</p>
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex-shrink-0 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-4 py-2.5 text-xs font-bold text-white"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-[var(--color-bg-dark)]"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Mobile "change design" overlay: same picker, opened from the sticky
          bar so users don't have to scroll back up to the grid. */}
      {pickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose a design"
          className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg-dark)] md:hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-4 py-4">
            <h2 className="text-base font-bold text-white">Choose a design</h2>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-text-gray)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-8">
            <DesignPicker
              designs={product.designs}
              selectedId={designId}
              onSelect={handleSelect}
              onUploadFile={handleUploadFile}
              currency={product.currency}
              categoryId={categoryId}
              sportSlug={sportSlug}
            />
          </div>
        </div>
      )}
    </>
  )
}
