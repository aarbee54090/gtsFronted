import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { getBySlug } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"
import type { NewArrival } from "@/lib/gts-hub-types"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<NewArrival>("/new-arrivals", slug)
  if (!res) return { title: "New Arrivals | GTS Hub" }
  return buildMetadata({
    seo: res.data.seo,
    fallbackTitle: res.data.title,
    fallbackDescription: res.data.description,
  })
}

export default async function NewArrivalDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<NewArrival>("/new-arrivals", slug)
  if (!res) notFound()
  const item = res.data

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <article className="mx-auto max-w-[900px] px-4 pb-20 pt-24">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-brand-green)]">
          {[item.sport, item.productType].filter(Boolean).join(" · ")}
        </div>
        <h1 className="mb-8 text-3xl font-bold text-white">{item.title}</h1>

        {item.images?.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {item.images.map((media, i) => (
              <HubMedia key={i} media={media} className="aspect-square w-full rounded-[var(--radius-lg)] object-cover" />
            ))}
          </div>
        )}

        {item.description && <p className="mb-8 text-sm leading-relaxed text-white/90">{item.description}</p>}

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
    </div>
  )
}
