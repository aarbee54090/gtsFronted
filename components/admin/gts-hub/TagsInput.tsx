"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface TagsInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

// Free-text tags (per the GTS Hub taxonomy decision: sport/productType are
// admin-constant dropdowns, but tags stay flexible free-text vocabulary).
export function TagsInput({ label, value, onChange, placeholder }: TagsInputProps) {
  const [draft, setDraft] = useState("")

  function commitDraft() {
    const trimmed = draft.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setDraft("")
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-white">{label}</label>
      <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-green)]"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              commitDraft()
            }
          }}
          onBlur={commitDraft}
          placeholder={placeholder ?? "Type and press Enter"}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-white placeholder:text-gray-600 focus:outline-none"
        />
      </div>
    </div>
  )
}
