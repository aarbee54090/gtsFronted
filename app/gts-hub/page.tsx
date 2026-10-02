import type { Metadata } from "next"
import { HubExplore } from "@/components/gts-hub/HubExplore"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { JsonLd } from "@/components/seo/JsonLd"
import { getPublishedPlatforms, getHubSectionImages } from "@/lib/api"
import { brandTitle, pageMetadata } from "@/lib/seo"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

export const metadata: Metadata = pageMetadata({
  title: brandTitle("GTS Hub: Our Work, Guides & Fabrics"),
  description:
    "Explore completed GoalThali Sports projects, the latest designs, jersey-making guides, and the fabrics behind every GTS jersey.",
  path: "/gts-hub",
})

export default async function GtsHubPage() {
  const [platforms, sectionImages] = await Promise.all([
    getPublishedPlatforms().catch(() => []),
    getHubSectionImages().catch(() => []),
  ])

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode([{ name: "GTS Hub", path: "/gts-hub" }]))} />
      <PageHeader
        eyebrow="GTS Hub"
        title="Explore the world of GTS"
        description="Real projects, new designs, fabric guides, and the story behind GoalThali Sports."
      />
      <section className="container-site pb-20">
        <HubExplore sectionImages={sectionImages} platforms={platforms} headingLevel="h2" />
      </section>
    </SiteShell>
  )
}
