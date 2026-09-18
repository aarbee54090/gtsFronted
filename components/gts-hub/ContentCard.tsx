import Link from "next/link"
import Image from "next/image"
import { HubMedia } from "./HubMedia"
import type { ContentType } from "@/lib/gts-hub-types"
import { HUB_BASE_PATH, HUB_TYPE_LABEL, type CardDisplayData } from "@/lib/gts-hub-card-helpers"
import { SaveButton } from "@/components/account/SaveButton"

interface ContentCardProps {
  contentType: ContentType
  data: CardDisplayData
  /** Shows a small type label badge - used in cross-type contexts like Related Content. */
  showTypeBadge?: boolean
}

export function ContentCard({ contentType, data, showTypeBadge }: ContentCardProps) {
  return (
    <Link
      href={`${HUB_BASE_PATH[contentType]}/${data.slug}`}
      className="group glass-sheen glass-bevel relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[16px] transition-all duration-[var(--duration-medium)] hover:-translate-y-1 hover:border-[var(--color-brand-green)] hover:shadow-[0_0_32px_rgba(182,255,0,0.18)]"
    >
      <SaveButton
        itemType={contentType}
        itemId={data.id}
        name={data.title}
        imageUrl={data.image?.url}
        slug={data.slug}
        className="absolute right-2 top-2 z-10"
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
        {data.image ? (
          data.imageMobileUrl ? (
            <>
              <Image
                src={data.imageMobileUrl}
                alt={data.title}
                fill
                sizes="100vw"
                className="block object-cover transition-transform group-hover:scale-105 sm:hidden"
              />
              <Image
                src={data.image.url}
                alt={data.title}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="hidden object-cover transition-transform group-hover:scale-105 sm:block"
              />
            </>
          ) : (
            <HubMedia media={data.image} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-600">No image</div>
        )}
        {showTypeBadge && (
          <span className="absolute left-2 top-2 rounded-[var(--radius-pill)] bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-brand-green)]">
            {HUB_TYPE_LABEL[contentType]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {data.meta && <span className="text-xs font-semibold text-[var(--color-brand-green)]">{data.meta}</span>}
        <h3 className="text-sm font-bold text-white">{data.title}</h3>
        {data.excerpt && <p className="line-clamp-2 text-xs text-[var(--color-text-gray)]">{data.excerpt}</p>}
      </div>
    </Link>
  )
}
