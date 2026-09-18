"use client"

import { useEffect, useState } from "react"
import { Check, Plus } from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { ContentType, RelatedContentRef, SuggestedRelatedEntry } from "@/lib/gts-hub-types"

interface RelatedContentPickerProps {
  value: RelatedContentRef[]
  onChange: (refs: RelatedContentRef[]) => void
  /** Current form values - suggestions are computed live from these. */
  criteria: { sport?: string; productType?: string; tags?: string[] }
  /** This content type - excluded from its own suggestions. */
  excludeType: ContentType
  /** Existing document's id (undefined when creating something new). */
  excludeId?: string
}

const TYPE_LABELS: Record<ContentType, string> = {
  portfolio: "Portfolio",
  journal: "Journal",
  "new-arrival": "New Arrival",
  material: "Material",
}

function displayName(item: SuggestedRelatedEntry["item"]): string {
  return (item as { title?: string; name?: string }).title ?? (item as { name?: string }).name ?? "Untitled"
}

function isSameRef(a: RelatedContentRef, b: RelatedContentRef) {
  return a.contentType === b.contentType && a.refId === b.refId
}

// Hybrid related-content UX per the locked architecture: the system
// auto-suggests candidates by shared sport/productType/tags (including
// drafts, since this is admin-only), and the admin approves/removes them.
// Manually-linked items that fall outside the current suggestion pool
// (no overlapping criteria) still show, just without rich details, since
// there's no batch "get by ids across 4 types" endpoint - acceptable
// trade-off rather than building one for this edge case.
export function RelatedContentPicker({ value, onChange, criteria, excludeType, excludeId }: RelatedContentPickerProps) {
  const [suggestions, setSuggestions] = useState<SuggestedRelatedEntry[]>([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasCriteria = criteria.sport || criteria.productType || (criteria.tags?.length ?? 0) > 0
    if (!hasCriteria) {
      setSuggestions([])
      return
    }
    const timeout = setTimeout(() => {
      setLoading(true)
      apiFetch<{ success: boolean; data: SuggestedRelatedEntry[] }>("/related-content/suggest", {
        method: "POST",
        requireAdmin: true,
        body: { ...criteria, excludeType, excludeId },
      })
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 400) // debounce - avoid a request on every keystroke while editing tags
    return () => clearTimeout(timeout)
  }, [criteria.sport, criteria.productType, criteria.tags?.join(","), excludeType, excludeId])

  function toggle(entry: { contentType: ContentType; refId: string }) {
    const exists = value.some((v) => isSameRef(v, entry as RelatedContentRef))
    if (exists) {
      onChange(value.filter((v) => !isSameRef(v, entry as RelatedContentRef)))
    } else {
      onChange([...value, { contentType: entry.contentType, refId: entry.refId }])
    }
  }

  // Manual picks not present in the current suggestion pool - shown with
  // just their id since we don't have their display details on hand.
  const unresolvedManual = value.filter(
    (v) => !suggestions.some((s) => s.contentType === v.contentType && s.item._id === v.refId)
  )

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Related Content
        </span>
        {loading && <span className="text-xs text-gray-600">Finding matches...</span>}
      </div>

      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-text-gray)]">Linked ({value.length}):</span>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => value.some((v) => isSameRef(v, { contentType: s.contentType, refId: s.item._id })))
              .map((s) => (
                <button
                  key={`${s.contentType}-${s.item._id}`}
                  type="button"
                  onClick={() => toggle({ contentType: s.contentType, refId: s.item._id })}
                  className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-green)]"
                >
                  <Check className="h-3 w-3" />
                  {TYPE_LABELS[s.contentType]}: {displayName(s.item)}
                </button>
              ))}
            {unresolvedManual.map((v) => (
              <span
                key={`${v.contentType}-${v.refId}`}
                className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-green)]"
              >
                {TYPE_LABELS[v.contentType]}: {v.refId.slice(-6)}
                <button type="button" onClick={() => toggle(v)} aria-label="Unlink">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-[var(--color-text-gray)]">
          Suggested (based on shared sport / product type / tags):
        </span>
        {suggestions.length === 0 && !loading && (
          <p className="text-xs text-gray-600">
            No matches yet - set a sport, product type, or tags above to see suggestions.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const linked = value.some((v) => isSameRef(v, { contentType: s.contentType, refId: s.item._id }))
            if (linked) return null // already shown in the "Linked" section above
            return (
              <button
                key={`${s.contentType}-${s.item._id}`}
                type="button"
                onClick={() => toggle({ contentType: s.contentType, refId: s.item._id })}
                className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 py-1 text-xs text-white transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
              >
                <Plus className="h-3 w-3" />
                {TYPE_LABELS[s.contentType]}: {displayName(s.item)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
