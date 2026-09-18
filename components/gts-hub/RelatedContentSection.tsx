import { ContentCard } from "./ContentCard"
import { toCardData } from "@/lib/gts-hub-card-helpers"
import type { RelatedContentEntry } from "@/lib/gts-hub-types"

interface RelatedContentSectionProps {
  related: RelatedContentEntry[] | undefined
}

export function RelatedContentSection({ related }: RelatedContentSectionProps) {
  if (!related || related.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white">Related Content</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((entry) => (
          <ContentCard
            key={`${entry.contentType}-${entry.item._id}`}
            contentType={entry.contentType}
            data={toCardData(entry.contentType, entry.item)}
            showTypeBadge
          />
        ))}
      </div>
    </section>
  )
}
