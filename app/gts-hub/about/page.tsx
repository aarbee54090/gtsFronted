import type { Metadata } from "next"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { JsonLd } from "@/components/seo/JsonLd"
import { getAboutPage } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"
import { stripHtml } from "@/lib/seo"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage()
  return buildMetadata({
    seo: page?.seo,
    // Not the CMS heading: that's a marketing line ("Custom Sportswear &
    // Jersey Printing in Nepal") that would duplicate the homepage title.
    fallbackTitle: "About Us",
    fallbackDescription: stripHtml(page?.body) || "Who we are and what GoalThali Sports is about.",
    path: "/gts-hub/about",
    images: [page?.heroImage],
  })
}

const TRAIL = [
  { name: "GTS Hub", path: "/gts-hub" },
  { name: "About Us", path: "/gts-hub/about" },
]

export default async function AboutPage() {
  const page = await getAboutPage()

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode(TRAIL))} />
      <PageHeader crumbs={TRAIL.slice(0, 1)} eyebrow="About Us" title={page?.heading || "Who We Are"} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-[var(--gutter)] pb-20">
        {page?.heroImage?.url && (
          <HubMedia
            media={page.heroImage}
            fallbackAlt={page.heading || "GoalThali Sports"}
            width={1200}
            height={800}
            preload
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-line)] object-cover"
          />
        )}

        {page?.body ? (
          // Admin-authored HTML from the Tiptap editor, not user-generated -
          // safe to render directly.
          <div className="prose-gts" dangerouslySetInnerHTML={{ __html: page.body }} />
        ) : (
          <p className="text-base text-[var(--color-text-gray)]">This page hasn&apos;t been set up yet.</p>
        )}

        <ContextualCTA
          title="See what we make"
          description="Browse completed projects, or start customizing a kit for your team."
          action={{ href: "/gts-hub/portfolio", label: "See Our Work" }}
        />
      </div>
    </SiteShell>
  )
}
