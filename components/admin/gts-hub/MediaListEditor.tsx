"use client"

import { Plus, X } from "lucide-react"
import type { MediaItem } from "@/lib/gts-hub-types"

const inputClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-2 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

function emptyMedia(): MediaItem {
  return { url: "", type: "image", provider: "cloudinary", alt: "", caption: "" }
}

interface MediaListEditorProps {
  label: string
  value: MediaItem[]
  onChange: (items: MediaItem[]) => void
}

// Pasted Cloudinary/YouTube/Vimeo URLs, same pattern as Product design
// images - no upload pipeline, admin pastes the URL directly.
export function MediaListEditor({ label, value, onChange }: MediaListEditorProps) {
  function updateItem(index: number, patch: Partial<MediaItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-white">{label}</label>
        <button
          type="button"
          onClick={() => onChange([...value, emptyMedia()])}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {value.length === 0 && <p className="text-xs text-gray-600">No media added yet.</p>}
      {value.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--glass-border)] p-3">
          <div className="flex items-start gap-2">
            <select
              value={item.type}
              onChange={(e) => updateItem(i, { type: e.target.value as MediaItem["type"] })}
              aria-label="Media type"
              className={`w-24 ${inputClasses}`}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <input
              value={item.url}
              onChange={(e) => updateItem(i, { url: e.target.value })}
              placeholder="https://res.cloudinary.com/... or video URL"
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              aria-label="Remove media"
              className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--glass-border)] p-1.5 text-[var(--color-error-red)] hover:border-[var(--color-error-red)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={item.alt ?? ""}
              onChange={(e) => updateItem(i, { alt: e.target.value })}
              placeholder="Alt text"
              className={inputClasses}
            />
            <input
              value={item.caption ?? ""}
              onChange={(e) => updateItem(i, { caption: e.target.value })}
              placeholder="Caption (optional)"
              className={inputClasses}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Single-item variant (Journal's coverImage is one MediaItem, not an array).
interface SingleMediaEditorProps {
  label: string
  value: MediaItem | undefined
  onChange: (item: MediaItem | undefined) => void
}

export function SingleMediaEditor({ label, value, onChange }: SingleMediaEditorProps) {
  const item = value ?? emptyMedia()
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-white">{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={item.url}
          onChange={(e) => onChange({ ...item, url: e.target.value })}
          placeholder="https://res.cloudinary.com/..."
          className={inputClasses}
        />
        <input
          value={item.alt ?? ""}
          onChange={(e) => onChange({ ...item, alt: e.target.value })}
          placeholder="Alt text"
          className={`w-40 ${inputClasses}`}
        />
      </div>
    </div>
  )
}
