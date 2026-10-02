import { ContentCard } from "./ContentCard"
import { ContextualCTA } from "./ContextualCTA"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { JsonLd } from "@/components/seo/JsonLd"
import { getPublishedList } from "@/lib/api"
import { toCardData } from "@/lib/gts-hub-card-helpers"
import { hubTrail } from "@/lib/gts-hub-metadata"
import type { ContentType } from "@/lib/gts-hub-types"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

interface HubListPageProps {
  contentType: ContentType
  apiBasePath: string
  title: string
  description: string
}

// The public list endpoint returns at most 50 per page - every hub section
// is well under that today.
const LIST_LIMIT = "50"

export async function HubListPage({ contentType, apiBasePath, title, description }: HubListPageProps) {
  const res = await getPublishedList<Record<string, unknown> & { _id: string; slug: string }>(apiBasePath, {
    limit: LIST_LIMIT,
  }).catch(() => null)
  const trail = hubTrail(contentType)

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode(trail))} />
      <PageHeader crumbs={trail.slice(0, -1)} eyebrow="GTS Hub" title={title} description={description} />

      <section className="container-site flex flex-col gap-14 pb-20">
        {!res ? (
          <p className="notice notice-warning">This section couldn&apos;t be loaded right now. Please try again in a moment.</p>
        ) : res.data.length === 0 ? (
          <p className="text-sm text-[var(--color-text-gray)]">Nothing published here yet - check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {res.data.map((item) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ContentCard key={item._id} contentType={contentType} data={toCardData(contentType, item as any)} titleAs="h2" />
            ))}
          </div>
        )}
        <ContextualCTA />
      </section>
    </SiteShell>
  )
}
