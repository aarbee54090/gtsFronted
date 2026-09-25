"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  ImageOff,
  Upload as UploadIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
} from "lucide-react"

import type { Design } from "@/lib/types"
import { SaveButton } from "@/components/account/SaveButton"

interface DesignPickerProps {
  designs: Design[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Called with the raw file when the customer uploads their own design, so the parent can preview it. */
  onUploadFile?: (file: File) => void
  currency?: string
  /** Designs shown per page. Defaults to 10 (5 columns x 2 rows on the widest screens). */
  pageSize?: number
  /** Passed through to each design's Save button, so a saved catalog design can later link back to this exact product/sport. */
  categoryId: string
  sportSlug: string
}

export function DesignPicker({
  designs,
  selectedId,
  onSelect,
  onUploadFile,
  currency = "₹",
  pageSize = 10,
  categoryId,
  sportSlug,
}: DesignPickerProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [page, setPage] = useState(0)
  const [lightboxDesign, setLightboxDesign] = useState<Design | null>(null)

  // Derived, not stored: the object URL is a pure function of the file.
  const uploadedPreviewUrl = useMemo(
    () => (uploadedFile ? URL.createObjectURL(uploadedFile) : null),
    [uploadedFile]
  )

  // The effect's only job is cleanup, which is a legitimate use of an effect.
  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl)
    }
  }, [uploadedPreviewUrl])

  const totalPages = Math.max(1, Math.ceil(designs.length / pageSize))
  const currentPage = Math.min(page, totalPages - 1)
  const visibleDesigns = designs.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  )

  return (
    <fieldset className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <legend className="text-base font-semibold text-white">Design</legend>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-[var(--color-bg-dark)] transition-transform hover:-translate-y-0.5"
        >
          <UploadIcon className="h-3.5 w-3.5" />
          Upload own design
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setUploadedFile(file)
              onSelect("custom-upload")
              onUploadFile?.(file)
            }
          }}
        />
      </div>
      {uploadedFile && uploadedPreviewUrl && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 p-3">
          <Image
            src={uploadedPreviewUrl}
            alt={uploadedFile.name}
            width={64}
            height={80}
            unoptimized
            className="h-20 w-16 rounded-[var(--radius-sm)] object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-green)]">
              Your design
            </p>
            <p className="truncate text-sm font-medium text-white">{uploadedFile.name}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            aria-label="Remove uploaded design"
            className="text-[var(--color-text-gray)] hover:text-[var(--color-error-red)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleDesigns.map((design) => {
          const selected = selectedId === design.id
          return (
            <div
              key={design.id}
              className={`relative flex flex-col gap-2 rounded-[var(--radius-md)] border p-3 transition-colors ${
                selected
                  ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10"
                  : "border-[var(--glass-border)] hover:border-gray-500"
              }`}
            >
              <SaveButton
                itemType="catalog"
                itemId={design.id}
                name={design.name}
                imageUrl={design.imageUrl}
                categoryId={categoryId}
                sportSlug={sportSlug}
                className="absolute right-2 top-2 z-10"
              />
              <button
                type="button"
                onClick={() => onSelect(design.id)}
                aria-pressed={selected}
                className="flex flex-col items-center gap-2"
              >
                {design.imageUrl ? (
                  <Image
                    src={design.imageUrl}
                    alt={design.name}
                    width={280}
                    height={360}
                    className="aspect-[3/4] w-full rounded-[var(--radius-sm)] object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border border-dashed border-gray-600 bg-black/20 text-gray-500"
                  >
                    <ImageOff className="h-6 w-6" strokeWidth={1.5} />
                    <span className="text-xs">Pending upload</span>
                  </span>
                )}
                <span className="text-sm font-medium text-white">{design.name}</span>
                {!!design.price && (
                  <span className="text-xs font-semibold text-[var(--color-brand-green)]">
                    {currency}
                    {design.price}
                  </span>
                )}
              </button>

              {design.imageUrl && (
                <div className="flex items-center justify-center gap-2 border-t border-[var(--glass-border)] pt-2">
                  <button
                    type="button"
                    onClick={() => setLightboxDesign(design)}
                    aria-label={`Preview ${design.name} full size`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--color-text-gray)] transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-text-gray)]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            aria-label="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {lightboxDesign?.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxDesign.name} full preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxDesign(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-3 flex max-h-[85vh] w-full max-w-lg flex-col gap-4 rounded-[var(--radius-lg)] p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{lightboxDesign.name}</h3>
              <button
                type="button"
                onClick={() => setLightboxDesign(null)}
                aria-label="Close preview"
                className="text-[var(--color-text-gray)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Image
              src={lightboxDesign.imageUrl}
              alt={lightboxDesign.name}
              width={500}
              height={640}
              className="max-h-[60vh] w-full rounded-[var(--radius-md)] object-contain"
            />
            <a
              href={lightboxDesign.imageUrl}
              download={lightboxDesign.name}
              className="flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] py-2.5 text-sm font-bold text-[var(--color-bg-dark)]"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      )}
    </fieldset>
  )
}
