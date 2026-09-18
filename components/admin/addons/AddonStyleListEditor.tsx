"use client"

import Image from "next/image"
import { Plus, X } from "lucide-react"
import type { AdminAddonStyle } from "@/lib/addon-types"

const inputClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-2 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

// New styles don't have a real _id yet - the backend assigns one on save.
// A temporary client-side key keeps React's list rendering stable until then.
let tempKeySeq = 0
function emptyStyle(): AdminAddonStyle {
  tempKeySeq += 1
  return { _id: `_new_${tempKeySeq}`, label: "", price: 0, imageUrl: "", description: "" }
}

interface AddonStyleListEditorProps {
  value: AdminAddonStyle[]
  onChange: (styles: AdminAddonStyle[]) => void
}

// Per-style preview image is a pasted Cloudinary URL, same convention as
// MediaListEditor (components/admin/gts-hub) - no upload pipeline, admin
// pastes the URL directly and it renders live for a sanity check.
export function AddonStyleListEditor({ value, onChange }: AddonStyleListEditorProps) {
  function updateStyle(index: number, patch: Partial<AdminAddonStyle>) {
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function removeStyle(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-white">Styles</label>
        <button
          type="button"
          onClick={() => onChange([...value, emptyStyle()])}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add style
        </button>
      </div>
      {value.length === 0 && <p className="text-xs text-gray-600">No styles yet - add at least one.</p>}
      {value.map((style, i) => (
        <div key={style._id} className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--glass-border)] p-3">
          <div className="flex items-start gap-2">
            <input
              value={style.label}
              onChange={(e) => updateStyle(i, { label: e.target.value })}
              placeholder="Style label, e.g. Number Print"
              className={inputClasses}
            />
            <input
              type="number"
              value={style.price}
              onChange={(e) => updateStyle(i, { price: Number(e.target.value) || 0 })}
              placeholder="Price"
              className={`w-24 ${inputClasses}`}
            />
            <button
              type="button"
              onClick={() => removeStyle(i)}
              aria-label="Remove style"
              className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--glass-border)] p-1.5 text-[var(--color-error-red)] hover:border-[var(--color-error-red)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-start gap-2">
            {style.imageUrl && (
              <Image
                src={style.imageUrl}
                alt={style.label || "Style preview"}
                width={40}
                height={40}
                className="h-10 w-10 flex-shrink-0 rounded-[var(--radius-sm)] object-cover"
                unoptimized
              />
            )}
            <input
              value={style.imageUrl ?? ""}
              onChange={(e) => updateStyle(i, { imageUrl: e.target.value })}
              placeholder="https://res.cloudinary.com/... (preview image)"
              className={inputClasses}
            />
          </div>
          <input
            value={style.description ?? ""}
            onChange={(e) => updateStyle(i, { description: e.target.value })}
            placeholder="Description shown in the preview (optional)"
            className={inputClasses}
          />
        </div>
      ))}
    </div>
  )
}
