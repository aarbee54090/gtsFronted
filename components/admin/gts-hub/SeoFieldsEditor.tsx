"use client"

import { useId } from "react"
import type { SeoFields } from "@/lib/gts-hub-types"
import { usableImageUrl } from "@/lib/seo"

const inputClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

interface SeoFieldsEditorProps {
  value: SeoFields | undefined
  onChange: (seo: SeoFields) => void
}

export function SeoFieldsEditor({ value, onChange }: SeoFieldsEditorProps) {
  const warningId = useId()
  const seo = value ?? {}
  // The public pages only use an OG image that's a real image URL (see
  // usableImageUrl) - flag anything else here instead of letting it be
  // silently ignored. Advisory only; saving is never blocked.
  const ogImage = seo.ogImage?.trim() ?? ""
  const ogImageIgnored = ogImage !== "" && !usableImageUrl(ogImage)
  return (
    <fieldset className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-4">
      <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[var(--color-text-gray)]">SEO</legend>
      <input
        value={seo.title ?? ""}
        onChange={(e) => onChange({ ...seo, title: e.target.value })}
        placeholder="SEO title (falls back to the main title if left blank)"
        className={inputClasses}
      />
      <textarea
        value={seo.description ?? ""}
        onChange={(e) => onChange({ ...seo, description: e.target.value })}
        placeholder="Meta description - shown in search results and link previews"
        rows={2}
        className={`${inputClasses} resize-none`}
      />
      <input
        value={seo.ogImage ?? ""}
        onChange={(e) => onChange({ ...seo, ogImage: e.target.value })}
        placeholder="Open Graph image URL, e.g. https://res.cloudinary.com/.../image/upload/... (controls social share preview)"
        aria-invalid={ogImageIgnored || undefined}
        aria-describedby={ogImageIgnored ? warningId : undefined}
        className={inputClasses}
      />
      {ogImageIgnored && (
        <p id={warningId} className="text-xs text-yellow-400">
          This isn&apos;t an image URL, so it won&apos;t be used - link previews fall back to the item&apos;s own
          image. Paste the full https:// link of an uploaded image (a res.cloudinary.com/.../image/upload/ URL or a
          .jpg/.png/.webp link), or leave it blank.
        </p>
      )}
    </fieldset>
  )
}
