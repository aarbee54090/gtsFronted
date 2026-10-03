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
import type { Material } from "@/lib/gts-hub-types"
import { brandTitle } from "@/lib/seo"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

interface PageProps {
  params: Promise<{ slug: string }>
}

const materialPath = (material: Material) => `${HUB_BASE_PATH.material}/${material.slug}`

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<Material>("/materials", slug)
  if (!res) return { title: brandTitle("Materials") }
  const material = res.data
  return buildMetadata({
    seo: material.seo,
    fallbackTitle: material.name,
    fallbackDescription:
      material.description ||
      `${material.name}${material.gsm ? ` (${material.gsm} GSM)` : ""} - one of the fabrics GoalThali Sports uses for custom sportswear.`,
    path: materialPath(material),
    images: [material.thumbnailImageUrl, ...(material.images ?? [])],
  })
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<Material>("/materials", slug)
  if (!res) notFound()
  const material = res.data
  const trail = hubTrail("material")

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode([...trail, { name: material.name, path: materialPath(material) }]))} />
      <article className="page-top mx-auto w-full max-w-3xl px-[var(--gutter)] pb-20">
        <HubBreadcrumbs crumbs={trail} />
        <div className="eyebrow mb-4 flex flex-wrap items-center gap-2">
          {material.category}
          {material.gsm ? ` · ${material.gsm} GSM` : ""}
        </div>
        <h1 className="display-lg mb-8">{material.name}</h1>

        {material.images?.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {material.images.map((media, i) => (
              <HubMedia
                key={i}
                media={media}
                fallbackAlt={material.name}
                className="aspect-square w-full rounded-[var(--radius-lg)] object-cover"
              />
            ))}
          </div>
        )}

        {material.description && <p className="mb-8 whitespace-pre-line text-[15px] leading-relaxed text-white/85">{material.description}</p>}

        {material.features?.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">Features</h2>
            <div className="flex flex-wrap gap-2">
              {material.features.map((f) => (
                <span key={f} className="glass-1 rounded-[var(--radius-pill)] px-3 py-1 text-xs text-white">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {material.suitableFor?.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
              Best For
            </h2>
            <div className="flex flex-wrap gap-2">
              {material.suitableFor.map((s) => (
                <span
                  key={s}
                  className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)]/15 px-3 py-1 text-xs font-semibold text-[var(--color-brand-green)]"
                >
                  {s}
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
