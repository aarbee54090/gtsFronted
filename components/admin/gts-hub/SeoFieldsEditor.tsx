"use client"

import type { SeoFields } from "@/lib/gts-hub-types"

const inputClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

interface SeoFieldsEditorProps {
  value: SeoFields | undefined
  onChange: (seo: SeoFields) => void
}

export function SeoFieldsEditor({ value, onChange }: SeoFieldsEditorProps) {
  const seo = value ?? {}
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
        placeholder="Open Graph image URL (controls social share preview)"
        className={inputClasses}
      />
    </fieldset>
  )
}
