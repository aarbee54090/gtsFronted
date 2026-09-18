import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { getBySlug } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"
import type { PortfolioProject } from "@/lib/gts-hub-types"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<PortfolioProject>("/portfolio", slug)
  if (!res) return { title: "Portfolio | GTS Hub" }
  return buildMetadata({
    seo: res.data.seo,
    fallbackTitle: res.data.title,
    fallbackDescription: res.data.description,
  })
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<PortfolioProject>("/portfolio", slug)
  if (!res) notFound()
  const project = res.data

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <article className="mx-auto max-w-[900px] px-4 pb-20 pt-24">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-brand-green)]">
          {[project.sport, project.productType].filter(Boolean).join(" · ")}
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">{project.title}</h1>
        {project.organizationName && (
          <p className="mb-8 text-sm text-[var(--color-text-gray)]">
            {project.organizationName}
            {project.organizationType ? ` · ${project.organizationType}` : ""}
            {project.quantity ? ` · ${project.quantity} pcs` : ""}
          </p>
        )}

        {project.finalImages?.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.finalImages.map((media, i) => (
              <HubMedia key={i} media={media} className="w-full rounded-[var(--radius-lg)] object-cover" />
            ))}
          </div>
        )}

        {project.description && <p className="mb-8 text-sm leading-relaxed text-white/90">{project.description}</p>}

        {(project.fabric || project.printingMethod) && (
          <div className="glass-bevel mb-8 grid grid-cols-2 gap-4 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-sm backdrop-blur-[16px]">
            {project.fabric && (
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Fabric</p>
                <p className="text-white">{project.fabric}</p>
              </div>
            )}
            {project.printingMethod && (
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Printing Method</p>
                <p className="text-white">{project.printingMethod}</p>
              </div>
            )}
          </div>
        )}

        {(project.designImages?.length > 0 || project.productionImages?.length > 0) && (
          <div className="mb-8 flex flex-col gap-6">
            {project.designImages?.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">Design</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {project.designImages.map((media, i) => (
                    <HubMedia key={i} media={media} className="w-full rounded-[var(--radius-md)] object-cover" />
                  ))}
                </div>
              </div>
            )}
            {project.productionImages?.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
                  Production
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {project.productionImages.map((media, i) => (
                    <HubMedia key={i} media={media} className="w-full rounded-[var(--radius-md)] object-cover" />
                  ))}
                </div>
              </div>
            )}
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
