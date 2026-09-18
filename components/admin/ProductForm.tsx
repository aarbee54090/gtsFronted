"use client";

import { useState } from "react";

interface DesignRow {
  name: string;
  imageUrl: string;
  price: string; // kept as string for the controlled input, parsed to number on submit
}

interface PricingTierRow {
  minQty: string;
  maxQty: string; // empty string means "and above" (null)
  price: string;
}

export interface ProductFormValues {
  name: string;
  category: string;
  sport: string;
  thumbnailImageUrl: string;
  thumbnailImageUrlMobile: string;
  designs: { name: string; imageUrl: string; price: number }[];
  pricingTiers: { minQty: number; maxQty: number | null; price: number }[];
}

export interface ProductFormInitialValues {
  name: string;
  category: string;
  sport: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  designs: { name: string; imageUrl: string; price?: number }[];
  pricingTiers?: { minQty: number; maxQty: number | null; price: number }[];
}

interface ProductFormProps {
  initialValues?: ProductFormInitialValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

const inputClasses =
  "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none";

const EMPTY_VALUES: ProductFormInitialValues = {
  name: "",
  category: "",
  sport: "",
  thumbnailImageUrl: "",
  thumbnailImageUrlMobile: "",
  designs: [{ name: "", imageUrl: "" }],
  pricingTiers: [],
};

export function ProductForm({
  initialValues = EMPTY_VALUES,
  submitLabel,
  submittingLabel,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [category, setCategory] = useState(initialValues.category);
  const [sport, setSport] = useState(initialValues.sport);
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState(initialValues.thumbnailImageUrl ?? "");
  const [thumbnailImageUrlMobile, setThumbnailImageUrlMobile] = useState(
    initialValues.thumbnailImageUrlMobile ?? ""
  );
  const [designs, setDesigns] = useState<DesignRow[]>(
    initialValues.designs.length > 0
      ? initialValues.designs.map((d) => ({
          name: d.name,
          imageUrl: d.imageUrl,
          price: d.price ? String(d.price) : "",
        }))
      : [{ name: "", imageUrl: "", price: "" }]
  );
  const [pricingTiers, setPricingTiers] = useState<PricingTierRow[]>(
    (initialValues.pricingTiers ?? []).map((t) => ({
      minQty: String(t.minQty),
      maxQty: t.maxQty === null ? "" : String(t.maxQty),
      price: String(t.price),
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateDesign(index: number, field: keyof DesignRow, value: string) {
    setDesigns((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  function addDesignRow() {
    setDesigns((prev) => [...prev, { name: "", imageUrl: "", price: "" }]);
  }

  function removeDesignRow(index: number) {
    setDesigns((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTier(index: number, field: keyof PricingTierRow, value: string) {
    setPricingTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTierRow() {
    setPricingTiers((prev) => [...prev, { minQty: "", maxQty: "", price: "" }]);
  }

  function removeTierRow(index: number) {
    setPricingTiers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        name,
        category,
        sport,
        thumbnailImageUrl,
        thumbnailImageUrlMobile,
        designs: designs
          .filter((d) => d.name && d.imageUrl)
          .map((d) => ({
            name: d.name,
            imageUrl: d.imageUrl,
            price: Number(d.price) || 0,
          })),
        pricingTiers: pricingTiers
          .filter((t) => t.minQty && t.price)
          .map((t) => ({
            minQty: Number(t.minQty),
            maxQty: t.maxQty ? Number(t.maxQty) : null,
            price: Number(t.price),
          })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-semibold text-white">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Football Jersey Kit"
          required
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-semibold text-white">Category</label>
        <input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Jersey Kit"
          required
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sport" className="text-sm font-semibold text-white">Sport</label>
        <input
          id="sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          placeholder="Football"
          required
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="thumbnailImageUrl" className="text-sm font-semibold text-white">
          Product Thumbnail Image (Desktop)
        </label>
        <input
          id="thumbnailImageUrl"
          value={thumbnailImageUrl}
          onChange={(e) => setThumbnailImageUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/... (used on the desktop sport-picker grid)"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="thumbnailImageUrlMobile" className="text-sm font-semibold text-white">
          Product Thumbnail Image (Mobile)
        </label>
        <input
          id="thumbnailImageUrlMobile"
          value={thumbnailImageUrlMobile}
          onChange={(e) => setThumbnailImageUrlMobile(e.target.value)}
          placeholder="https://res.cloudinary.com/... (wide crop for the mobile sport-picker cards - falls back to the desktop image above if left blank)"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Designs</span>
          <button
            type="button"
            onClick={addDesignRow}
            className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
          >
            + Add Design
          </button>
        </div>

        {designs.map((design, index) => (
          <div key={index} className="flex items-start gap-2">
            <input
              value={design.name}
              onChange={(e) => updateDesign(index, "name", e.target.value)}
              placeholder="Design name"
              className={`flex-1 ${inputClasses}`}
            />
            <input
              value={design.imageUrl}
              onChange={(e) => updateDesign(index, "imageUrl", e.target.value)}
              placeholder="Image URL"
              className={`flex-[2] ${inputClasses}`}
            />
            <input
              type="number"
              min={0}
              value={design.price}
              onChange={(e) => updateDesign(index, "price", e.target.value)}
              placeholder="Price"
              aria-label={`${design.name || "Design"} price`}
              className={`w-24 ${inputClasses}`}
            />
            {designs.length > 1 && (
              <button
                type="button"
                onClick={() => removeDesignRow(index)}
                aria-label="Remove design"
                className="rounded-[var(--radius-sm)] border border-[var(--glass-border)] px-3 py-2 text-sm text-[var(--color-error-red)] hover:border-[var(--color-error-red)]"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Pricing Tiers (by quantity)</span>
          <button
            type="button"
            onClick={addTierRow}
            className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
          >
            + Add Tier
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-gray)]">
          Leave &quot;Max qty&quot; blank for the top, uncapped tier (e.g. &quot;6+ pcs&quot;).
        </p>

        {pricingTiers.length === 0 && (
          <p className="text-xs text-[var(--color-text-gray)]">No pricing tiers yet.</p>
        )}

        {pricingTiers.map((tier, index) => (
          <div key={index} className="flex items-start gap-2">
            <input
              type="number"
              min={1}
              value={tier.minQty}
              onChange={(e) => updateTier(index, "minQty", e.target.value)}
              placeholder="Min qty"
              aria-label="Minimum quantity"
              className={`flex-1 ${inputClasses}`}
            />
            <input
              type="number"
              min={1}
              value={tier.maxQty}
              onChange={(e) => updateTier(index, "maxQty", e.target.value)}
              placeholder="Max qty (blank = +)"
              aria-label="Maximum quantity"
              className={`flex-1 ${inputClasses}`}
            />
            <input
              type="number"
              min={0}
              value={tier.price}
              onChange={(e) => updateTier(index, "price", e.target.value)}
              placeholder="Price"
              aria-label="Tier price"
              className={`flex-1 ${inputClasses}`}
            />
            <button
              type="button"
              onClick={() => removeTierRow(index)}
              aria-label="Remove pricing tier"
              className="rounded-[var(--radius-sm)] border border-[var(--glass-border)] px-3 py-2 text-sm text-[var(--color-error-red)] hover:border-[var(--color-error-red)]"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
