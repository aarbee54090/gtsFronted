"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Upload, Plus } from "lucide-react"

import type { ProductDetail, PlayerRow } from "@/lib/types"
import {
  computeQuote,
  getTierPrice,
  computeVariantSurcharge,
  type AddonSelection,
} from "@/lib/pricing"
import { MOCK_COUPON } from "@/lib/mock-products"
import { saveOrderDraft, fileToDataUrl } from "@/lib/order-draft"
import { loadUploadedDesignImage, clearUploadedDesignImage } from "@/lib/uploaded-design"
import {
  ConfigFieldInput,
  type ConfigFieldValue,
} from "./ConfigFieldInput"
import { AddonsPicker } from "./AddonsPicker"
import { AdditionalFilesUpload, type AdditionalFilesUploadHandle } from "./AdditionalFilesUpload"
import { PlayerDetailsForm, type PlayerDetailsFormHandle } from "./PlayerDetailsForm"
import { Card } from "./Card"

interface CustomizerProps {
  product: ProductDetail
  /** Design chosen on the previous step, already resolved by the page (real backend data or the custom-upload placeholder). */
  selectedDesign: { name: string; imageUrl?: string; price?: number } | null
  categoryId: string
  sportSlug: string
}

export function Customizer({ product, selectedDesign, categoryId, sportSlug }: CustomizerProps) {
  const router = useRouter()
  const [fieldValues, setFieldValues] = useState<Record<string, ConfigFieldValue>>({})
  const [addons, setAddons] = useState<AddonSelection[]>([])
  const [quantity, setQuantity] = useState(0)
  const [deadlineDate, setDeadlineDate] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [players, setPlayers] = useState<PlayerRow[]>([])
  const filesRef = useRef<AdditionalFilesUploadHandle>(null)
  const playersRef = useRef<PlayerDetailsFormHandle>(null)

  // Deliberate exception to react-hooks/set-state-in-effect: sessionStorage
  // can only be read after mount. The uploaded file lives on the previous
  // page (design gallery) and only its data URL survives navigation here.
  useEffect(() => {
    if (selectedDesign && !selectedDesign.imageUrl) {
      const saved = loadUploadedDesignImage()
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUploadedImageUrl(saved)
        clearUploadedDesignImage()
      }
    }
  }, [selectedDesign])

  const effectiveSelectedDesign =
    selectedDesign && !selectedDesign.imageUrl && uploadedImageUrl
      ? { ...selectedDesign, imageUrl: uploadedImageUrl }
      : selectedDesign

  // Sleeve Type / Collar Type are quantity_per_variant fields, but they no
  // longer drive the order's total quantity - they're opt-in upgrades
  // ("N of my total pieces get this"), capped at the Total Quantity below.
  const variantFields = product.configFields.filter((f) => f.type === "quantity_per_variant")
  const otherFields = product.configFields.filter((f) => f.type !== "quantity_per_variant")

  const variantSurcharge = computeVariantSurcharge(product.configFields, fieldValues)

  const quote = useMemo(() => {
    return computeQuote(
      {
        product,
        designPrice: selectedDesign?.price,
        tierPrice: getTierPrice(product.pricingTiers, quantity),
        variantSurcharge,
        quantity,
        addons,
        deadlineDate: deadlineDate || null,
        couponCode: couponCode || null,
      },
      MOCK_COUPON
    )
  }, [product, selectedDesign, quantity, variantSurcharge, addons, deadlineDate, couponCode])

  const handleFieldChange = (key: string, value: ConfigFieldValue) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  // Human-readable breakdown shown in the Order Summary and the downloaded
  // quotation - design, sleeve/collar split, and each addon selected.
  const sleeveField = variantFields.find((f) => f.key === "sleeveType")
  const sleeveBreakdown = sleeveField
    ? Object.entries((fieldValues[sleeveField.key] as Record<string, number>) ?? {})
        .filter(([, qty]) => qty > 0)
        .map(([label, qty]) => ({ label, quantity: qty }))
    : []
  const collarField = variantFields.find((f) => f.key === "collarType")
  const collarBreakdown = collarField
    ? Object.entries((fieldValues[collarField.key] as Record<string, number>) ?? {})
        .filter(([, qty]) => qty > 0)
        .map(([label, qty]) => ({ label, quantity: qty }))
    : []
  const addonLines = addons
    .filter((sel) => sel.quantity > 0)
    .map((sel) => {
      const addon = product.addons.find((a) => a.id === sel.addonId)
      const style = addon?.styles.find((s) => s.id === sel.styleId)
      return {
        addonName: addon?.name ?? "Addon",
        styleLabel: style?.label ?? "",
        quantity: sel.quantity,
        price: style?.price ?? 0,
      }
    })

  async function handleGetQuotation() {
    const convertedFiles = await Promise.all(
      additionalFiles.map(async (file) => ({
        filename: file.name,
        dataUrl: await fileToDataUrl(file),
      }))
    )

    saveOrderDraft({
      productName: product.name,
      designName: selectedDesign?.name ?? "Custom upload",
      designImageUrl: effectiveSelectedDesign?.imageUrl,
      categoryId,
      sportSlug,
      sleeveBreakdown,
      collarBreakdown,
      addonLines,
      players,
      additionalFiles: convertedFiles,
      quantity,
      deadlineDate,
      couponCode,
      quote,
    })
    router.push(`/customize/${categoryId}/${sportSlug}/quotation`)
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Design + Change design + Total quantity, all in one row */}
        <Card className="flex flex-wrap items-center justify-between gap-4">
          {effectiveSelectedDesign && (
            <div className="flex items-center gap-4">
              {effectiveSelectedDesign.imageUrl && (
                <Image
                  src={effectiveSelectedDesign.imageUrl}
                  alt={effectiveSelectedDesign.name}
                  width={64}
                  height={80}
                  unoptimized={effectiveSelectedDesign.imageUrl.startsWith("data:")}
                  className="h-20 w-16 rounded-[var(--radius-sm)] object-cover"
                />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-gray)]">
                  Design
                </p>
                <p className="text-sm font-bold text-white">{effectiveSelectedDesign.name}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col items-end gap-1.5">
            <Link
              href={`/customize/${categoryId}/${sportSlug}`}
              className="text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
            >
              Change design
            </Link>
            <div className="flex flex-col items-end gap-1">
              <label htmlFor="total-quantity" className="text-xs font-semibold text-white">
                Total quantity
              </label>
              <input
                id="total-quantity"
                type="number"
                min={0}
                value={quantity || ""}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-32 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-lg font-bold text-[var(--color-brand-green)] focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </div>
        </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">
                Additional Files, Logo &amp; Player Details
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => filesRef.current?.openFilePicker()}
                  className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload files
                </button>
                <button
                  type="button"
                  onClick={() => playersRef.current?.addRow()}
                  className="flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-bold text-[var(--color-bg-dark)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Player
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-gray)]">
              Upload logos, sponsor artwork, reference files, or a player-list spreadsheet (.xlsx/.xls auto-fills the
              player table below) - or add players directly. Optional either way, doesn&apos;t affect quantity or
              pricing.
            </p>

            <AdditionalFilesUpload
              ref={filesRef}
              files={additionalFiles}
              onChange={setAdditionalFiles}
              hideHeader
              onFilesPicked={(picked) => {
                const isSpreadsheet = (f: File) => /\.(xlsx|xls)$/i.test(f.name)
                const spreadsheets = picked.filter(isSpreadsheet)
                spreadsheets.forEach((f) => playersRef.current?.importExcelFile(f))
                return picked.filter((f) => !isSpreadsheet(f))
              }}
            />

            <div className="border-t border-[var(--glass-border)] pt-4">
              <PlayerDetailsForm
                ref={playersRef}
                players={players}
                onChange={setPlayers}
                sleeveOptions={sleeveField?.options ?? []}
                neckOptions={collarField?.options ?? []}
                addonOptions={product.addons.map((a) => a.name)}
                hideHeader
              />
            </div>
          </Card>

          {variantFields.length > 0 && (
            <Card>
              <p className="mb-4 text-xs text-[var(--color-text-gray)]">
                Option only for jersey <span className="text-[var(--color-brand-green)]">*</span> (optional)
              </p>
              {/* Always 2 columns, even on narrow phones, so Sleeve Type and
                  Collar Type sit side by side instead of stacking. */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {variantFields.map((field) => (
                  <ConfigFieldInput
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key]}
                    onChange={handleFieldChange}
                    maxTotal={quantity}
                  />
                ))}
              </div>
            </Card>
          )}

          {otherFields.length > 0 && (
            <Card className="flex flex-col gap-6">
              {otherFields.map((field) => (
                <ConfigFieldInput
                  key={field.key}
                  field={field}
                  value={fieldValues[field.key]}
                  onChange={handleFieldChange}
                />
              ))}
            </Card>
          )}

          <Card>
            <AddonsPicker
              addons={product.addons}
              currency={product.currency}
              selections={addons}
              onChange={setAddons}
            />
          </Card>

          <Card>
            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-sm font-semibold text-white">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Anything else we should know about your order?"
                className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </Card>

          {/* Deadline + Coupon - simple inputs that affect price, kept here
              rather than needing their own page. The full pricing breakdown
              itself now lives on the dedicated quotation page. */}
          <Card className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="deadline" className="text-sm font-semibold text-white">
                Delivery Date (optional)
              </label>
              <input
                id="deadline"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              />
              <p className="text-xs text-[var(--color-text-gray)]">
                Minimum 2 days required to manufacture. For emergency orders, contact us.
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="coupon" className="text-sm font-semibold text-white">
                Coupon code (optional)
              </label>
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="uppercase rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </Card>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-[var(--color-text-gray)]">Estimated total</span>
              <span className="text-xl font-extrabold text-white" data-testid="order-total">
                {quote.currency}
                {quote.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleGetQuotation}
              disabled={quantity <= 0}
              className="w-full rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Get Quotation →
            </button>
            {quantity <= 0 && (
              <p className="text-center text-xs text-[var(--color-error-red)]">
                Enter at least one quantity to get a quote.
              </p>
            )}
          </div>
    </div>
  )
}
