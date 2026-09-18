import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { getBySlug } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"
import type { Material } from "@/lib/gts-hub-types"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<Material>("/materials", slug)
  if (!res) return { title: "Materials | GTS Hub" }
  return buildMetadata({
    seo: res.data.seo,
    fallbackTitle: res.data.name,
    fallbackDescription: res.data.description,
  })
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<Material>("/materials", slug)
  if (!res) notFound()
  const material = res.data

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <article className="mx-auto max-w-[800px] px-4 pb-20 pt-24">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-brand-green)]">
          {material.category}
          {material.gsm ? ` · ${material.gsm} GSM` : ""}
        </div>
        <h1 className="mb-8 text-3xl font-bold text-white">{material.name}</h1>

        {material.images?.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {material.images.map((media, i) => (
              <HubMedia key={i} media={media} className="w-full rounded-[var(--radius-lg)] object-cover" />
            ))}
          </div>
        )}

        {material.description && <p className="mb-8 text-sm leading-relaxed text-white/90">{material.description}</p>}

        {material.features?.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">Features</h2>
            <div className="flex flex-wrap gap-2">
              {material.features.map((f) => (
                <span key={f} className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-3 py-1 text-xs text-white">
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
    </div>
  )
}
