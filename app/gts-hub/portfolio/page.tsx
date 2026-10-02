import type { Metadata } from "next"
import { ProjectCard } from "@/components/our-work/ProjectCard"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { JsonLd } from "@/components/seo/JsonLd"
import { getPublishedList } from "@/lib/api"
import { hubTrail } from "@/lib/gts-hub-metadata"
import type { PortfolioProject } from "@/lib/gts-hub-types"
import { OUR_WORK_PATH } from "@/lib/our-work"
import { brandTitle, pageMetadata } from "@/lib/seo"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

// "Our Work" keeps the original /gts-hub/portfolio URL (already indexed and
// in the sitemap); /our-work and /portfolio permanently redirect here.
export const metadata: Metadata = pageMetadata({
  title: brandTitle("Our Work: Custom Team Jerseys We've Made"),
  description:
    "Custom jerseys and sportswear GoalThali Sports has made for schools, clubs and teams in Nepal - with the sport, fabric and printing method for each.",
  path: OUR_WORK_PATH,
})

export default async function OurWorkPage() {
  const res = await getPublishedList<PortfolioProject>("/portfolio", { limit: "50" }).catch(() => null)
  const trail = hubTrail("portfolio")

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode(trail))} />
      <PageHeader
        crumbs={trail.slice(0, -1)}
        eyebrow="Our Work"
        title="Kits we've made"
        description="Completed projects for schools, clubs, and teams - each with photos of the finished kit and the details of how it was made. See something you like? Start from a similar design."
      />

      <section className="container-site flex flex-col gap-14 pb-20">
        {!res ? (
          <p className="notice notice-warning">Our projects couldn&apos;t be loaded right now. Please try again in a moment.</p>
        ) : res.data.length === 0 ? (
          <p className="text-sm text-[var(--color-text-gray)]">No projects published yet - check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {res.data.map((project) => (
              <ProjectCard key={project._id} project={project} titleAs="h2" />
            ))}
          </div>
        )}
        <ContextualCTA
          title="Want a kit like these?"
          description="Choose a product and design, or bring your own artwork - you'll see your price as you customize."
        />
      </section>
    </SiteShell>
  )
}
