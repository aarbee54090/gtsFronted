"use client";

import { useState } from "react";

export interface MainProductFormValues {
  name: string;
  thumbnailImageUrl: string;
  thumbnailImageUrlMobile: string;
  description: string;
  isActive: boolean;
}

export interface MainProductFormInitialValues {
  name: string;
  thumbnailImageUrl?: string;
  thumbnailImageUrlMobile?: string;
  description?: string;
  isActive?: boolean;
}

interface MainProductFormProps {
  initialValues?: MainProductFormInitialValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: MainProductFormValues) => Promise<void>;
}

const inputClasses =
  "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none";

const EMPTY_VALUES: MainProductFormInitialValues = {
  name: "",
  thumbnailImageUrl: "",
  thumbnailImageUrlMobile: "",
  description: "",
  isActive: true,
};

export function MainProductForm({
  initialValues = EMPTY_VALUES,
  submitLabel,
  submittingLabel,
  onSubmit,
}: MainProductFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState(initialValues.thumbnailImageUrl ?? "");
  const [thumbnailImageUrlMobile, setThumbnailImageUrlMobile] = useState(
    initialValues.thumbnailImageUrlMobile ?? ""
  );
  const [description, setDescription] = useState(initialValues.description ?? "");
  const [isActive, setIsActive] = useState(initialValues.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, thumbnailImageUrl, thumbnailImageUrlMobile, description, isActive });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-semibold text-white">
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jersey"
          required
          className={inputClasses}
        />
        <p className="text-xs text-[var(--color-text-gray)]">
          Must exactly match the &quot;Category&quot; field used on the matching sub-products
          (e.g. Basketball Jersey, Football Jersey) - this is a plain text match, not a
          dropdown, so double-check spelling.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="thumbnailImageUrl" className="text-sm font-semibold text-white">
          Thumbnail Image (Desktop)
        </label>
        <input
          id="thumbnailImageUrl"
          value={thumbnailImageUrl}
          onChange={(e) => setThumbnailImageUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/... (shown on the /products landing page card)"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="thumbnailImageUrlMobile" className="text-sm font-semibold text-white">
          Thumbnail Image (Mobile)
        </label>
        <input
          id="thumbnailImageUrlMobile"
          value={thumbnailImageUrlMobile}
          onChange={(e) => setThumbnailImageUrlMobile(e.target.value)}
          placeholder="https://res.cloudinary.com/... (used on small screens - falls back to the desktop image above if left blank)"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-semibold text-white">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Custom jerseys, made to order"
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-white">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4"
        />
        Active (shown on the /products landing page)
      </label>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
