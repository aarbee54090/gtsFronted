import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CalendarDays, MessageCircle } from "lucide-react"
import { HubBreadcrumbs } from "@/components/gts-hub/HubBreadcrumbs"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { SiteShell } from "@/components/site/SiteShell"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/seo/JsonLd"
import { fetchActiveProducts, fetchProductById, getBySlug, getContactInfo } from "@/lib/api"
import { buildMetadata, hubTrail } from "@/lib/gts-hub-metadata"
import type { MediaItem, PortfolioProject } from "@/lib/gts-hub-types"
import {
  projectClient,
  projectImageAlt,
  projectMeta,
  projectPath,
  projectTitle,
  similarDesignLink,
} from "@/lib/our-work"
import { absoluteUrl, brandTitle } from "@/lib/seo"
import { whatsappLink } from "@/lib/site"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<PortfolioProject>("/portfolio", slug)
  if (!res) return { title: brandTitle("Our Work") }
  const project = res.data
  const title = projectTitle(project)
  const kind = [project.sport, project.productType].filter(Boolean).join(" ").toLowerCase() || "sportswear"
  const client = projectClient(project)
  return buildMetadata({
    seo: project.seo,
    fallbackTitle: `${title} - Our Work`,
    fallbackDescription:
      project.description ||
      `A custom ${kind} project made by GoalThali Sports${client && client !== "Individual order" ? ` for ${client}` : ""}.`,
    path: projectPath(project),
    images: [project.thumbnailImageUrl, ...(project.finalImages ?? []), ...(project.designImages ?? [])],
  })
}

function images(list: MediaItem[] | undefined): MediaItem[] {
  return (list ?? []).filter((media) => media?.url)
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<PortfolioProject>("/portfolio", slug)
  if (!res) notFound()
  const project = res.data
  const title = projectTitle(project)
  const meta = projectMeta(project)
  const client = projectClient(project)
  const trail = hubTrail("portfolio")

  const [contact, products, usedProduct] = await Promise.all([
    getContactInfo().catch(() => null),
    fetchActiveProducts(),
    project.usedDesign?.productId ? fetchProductById(project.usedDesign.productId) : Promise.resolve(null),
  ])
  const similar = similarDesignLink(project, products, usedProduct)

  const finals = images(project.finalImages)
  const designs = images(project.designImages)
  const production = images(project.productionImages)
  const [cover, ...moreFinals] = finals

  const specs = [
    { label: "Sport", value: project.sport },
    { label: "Product", value: project.productType },
    { label: "Fabric", value: project.fabric },
    { label: "Printing", value: project.printingMethod },
    { label: "Quantity", value: project.quantity ? `${project.quantity} pcs` : undefined },
    { label: "Made for", value: client },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value))

  const whatsappMessage = `Hi GoalThali Sports, I'd like a kit similar to "${title}" (${absoluteUrl(projectPath(project))}).`

  return (
    <SiteShell contact={contact}>
      <JsonLd data={jsonLd(breadcrumbNode([...trail, { name: title, path: projectPath(project) }]))} />

      <article className="container-site page-top pb-20">
        <HubBreadcrumbs crumbs={trail} />
        <div className="mb-8 flex max-w-3xl flex-col gap-3">
          {meta && <p className="eyebrow">{meta}</p>}
          <h1 className="display-lg">{title}</h1>
          {client && <p className="text-sm text-[var(--color-text-gray)]">{client}</p>}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4">
            {cover && (
              <HubMedia
                media={cover}
                fallbackAlt={title}
                altOverride={projectImageAlt(cover, title, "finished kit", 0)}
                width={1100}
                height={1375}
                preload
                className="aspect-[4/5] w-full rounded-[var(--radius-lg)] border border-[var(--color-line)] object-cover"
              />
            )}
            {moreFinals.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {moreFinals.map((media, i) => (
                  <HubMedia
                    key={`${media.url}-${i}`}
                    media={media}
                    fallbackAlt={title}
                    altOverride={projectImageAlt(media, title, "finished kit", i + 1)}
                    width={600}
                    height={750}
                    className="aspect-[4/5] w-full rounded-[var(--radius-md)] border border-[var(--color-line)] object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            {specs.length > 0 && (
              <dl className="surface-card grid grid-cols-2 gap-x-4 gap-y-4 p-5 sm:p-6">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-gray)]">{spec.label}</dt>
                    <dd className="text-sm font-semibold text-white">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {project.description && (
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-white/85">{project.description}</p>
            )}

            <div className="surface-card flex flex-col gap-3 p-5 sm:p-6">
              <h2 className="card-title">Want something like this?</h2>
              <p className="card-text">
                Start from a similar design and make it yours - your colours, logo, names, and numbers.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href={similar.href}>
                  {similar.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <a href={whatsappLink(contact?.whatsapp, whatsappMessage)} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Ask about this project
                </a>
              </Button>
              <Link
                href="/gts-hub/contact#book-a-visit"
                className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-text-gray)] hover:text-white"
              >
                <CalendarDays className="h-4 w-4 text-[var(--color-brand-green)]" aria-hidden="true" /> Or book a visit
              </Link>
            </div>
          </aside>
        </div>

        {(designs.length > 0 || production.length > 0) && (
          <div className="mt-14 flex flex-col gap-10">
            {designs.length > 0 && (
              <section aria-labelledby="design-heading">
                <h2 id="design-heading" className="display-md mb-5">
                  The design
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {designs.map((media, i) => (
                    <HubMedia
                      key={`${media.url}-${i}`}
                      media={media}
                      fallbackAlt={title}
                      altOverride={projectImageAlt(media, title, "design artwork", i)}
                      width={600}
                      height={600}
                      className="aspect-square w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-black/30 object-contain"
                    />
                  ))}
                </div>
              </section>
            )}
            {production.length > 0 && (
              <section aria-labelledby="production-heading">
                <h2 id="production-heading" className="display-md mb-5">
                  In production
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {production.map((media, i) => (
                    <HubMedia
                      key={`${media.url}-${i}`}
                      media={media}
                      fallbackAlt={title}
                      altOverride={projectImageAlt(media, title, "production", i)}
                      width={600}
                      height={600}
                      className="aspect-square w-full rounded-[var(--radius-md)] border border-[var(--color-line)] object-cover"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-16">
          <RelatedContentSection related={res.related} />
        </div>
      </article>
    </SiteShell>
  )
}
