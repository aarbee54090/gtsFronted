import Link from "next/link"
import { HubMedia } from "./HubMedia"
import { CardPhoto } from "@/components/shared/CardPhoto"
import type { ContentType } from "@/lib/gts-hub-types"
import { HUB_BASE_PATH, HUB_TYPE_LABEL, type CardDisplayData } from "@/lib/gts-hub-card-helpers"
import { SaveButton } from "@/components/account/SaveButton"

interface ContentCardProps {
  contentType: ContentType
  data: CardDisplayData
  /** Shows a small type label badge - used in cross-type contexts like Related Content. */
  showTypeBadge?: boolean
  /** h2 when the cards sit directly under the page's h1 (list pages); h3 under a section h2. */
  titleAs?: "h2" | "h3"
}

// The whole card is a link; the save (heart) button sits beside the link,
// not inside it - a button nested in a link is invalid HTML and confuses
// screen readers.
export function ContentCard({ contentType, data, showTypeBadge, titleAs: Title = "h3" }: ContentCardProps) {
  return (
    <article className="group surface-card surface-card-interactive relative flex flex-col overflow-hidden">
      <Link href={`${HUB_BASE_PATH[contentType]}/${data.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
          {data.image ? (
            data.image.type === "video" ? (
              <HubMedia
                media={data.image}
                fallbackAlt={data.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              // The admin's mobile crop (when it's really a different image)
              // is served to phones through <picture>; one download either way.
              <CardPhoto
                src={data.image.url}
                mobileSrc={data.imageMobileUrl}
                alt={data.image.alt?.trim() || data.title}
                sizes="(max-width: 1024px) 50vw, 33vw"
                mobileSizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-gray)]">No image</div>
          )}
          {showTypeBadge && (
            <span className="absolute left-3 top-3 rounded-[var(--radius-pill)] bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-brand-green)]">
              {HUB_TYPE_LABEL[contentType]}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-5">
          {data.meta && <span className="eyebrow">{data.meta}</span>}
          <Title className="card-title">{data.title}</Title>
          {data.excerpt && <p className="card-text line-clamp-2">{data.excerpt}</p>}
        </div>
      </Link>
      <SaveButton
        itemType={contentType}
        itemId={data.id}
        name={data.title}
        imageUrl={data.image?.url}
        slug={data.slug}
        className="absolute right-3 top-3 z-10"
      />
    </article>
  )
}
