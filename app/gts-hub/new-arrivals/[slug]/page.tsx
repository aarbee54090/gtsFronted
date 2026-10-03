import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteShell } from "@/components/site/SiteShell"
import { HubBreadcrumbs } from "@/components/gts-hub/HubBreadcrumbs"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { JsonLd } from "@/components/seo/JsonLd"
import { getBySlug } from "@/lib/api"
import { HUB_BASE_PATH } from "@/lib/gts-hub-card-helpers"
import { buildMetadata, hubTrail } from "@/lib/gts-hub-metadata"
import type { NewArrival } from "@/lib/gts-hub-types"
import { brandTitle } from "@/lib/seo"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

interface PageProps {
  params: Promise<{ slug: string }>
}

const itemPath = (item: NewArrival) => `${HUB_BASE_PATH["new-arrival"]}/${item.slug}`

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<NewArrival>("/new-arrivals", slug)
  if (!res) return { title: brandTitle("New Arrivals") }
  const item = res.data
  const kind = [item.sport, item.productType].filter(Boolean).join(" ").toLowerCase()
  return buildMetadata({
    seo: item.seo,
    fallbackTitle: item.title,
    fallbackDescription: item.description || `${item.title} - new ${kind ? `${kind} ` : ""}designs from GoalThali Sports.`,
    path: itemPath(item),
    images: [item.thumbnailImageUrl, ...(item.images ?? [])],
  })
}

export default async function NewArrivalDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<NewArrival>("/new-arrivals", slug)
  if (!res) notFound()
  const item = res.data
  const trail = hubTrail("new-arrival")

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode([...trail, { name: item.title, path: itemPath(item) }]))} />
      <article className="page-top mx-auto w-full max-w-4xl px-[var(--gutter)] pb-20">
        <HubBreadcrumbs crumbs={trail} />
        <div className="eyebrow mb-4 flex flex-wrap items-center gap-2">
          {[item.sport, item.productType].filter(Boolean).join(" · ")}
        </div>
        <h1 className="display-lg mb-8">{item.title}</h1>

        {item.images?.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {item.images.map((media, i) => (
              <HubMedia
                key={i}
                media={media}
                fallbackAlt={item.title}
                className="aspect-square w-full rounded-[var(--radius-lg)] object-cover"
              />
            ))}
          </div>
        )}

        {item.description && <p className="mb-8 whitespace-pre-line text-[15px] leading-relaxed text-white/85">{item.description}</p>}

        {item.availableCustomization?.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
              Available Customization
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.availableCustomization.map((option) => (
                <span
                  key={option}
                  className="glass-1 rounded-[var(--radius-pill)] px-3 py-1 text-xs text-white"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <ContextualCTA />
        </div>

        <RelatedContentSection related={res.related} />
      </article>
    </SiteShell>
  )
}
