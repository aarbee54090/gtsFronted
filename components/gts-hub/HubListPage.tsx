import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { ContentCard } from "./ContentCard"
import { getPublishedList } from "@/lib/api"
import { toCardData } from "@/lib/gts-hub-card-helpers"
import type { ContentType } from "@/lib/gts-hub-types"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface HubListPageProps {
  contentType: ContentType
  apiBasePath: string
  title: string
  description: string
}

export async function HubListPage({ contentType, apiBasePath, title, description }: HubListPageProps) {
  const res = await getPublishedList<Record<string, unknown> & { _id: string; slug: string }>(apiBasePath, {
    limit: "24",
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <section className="mx-auto max-w-[1100px] px-4 pb-20 pt-32">
        <div className="mb-4">
          <Link href="/gts-hub" className="text-xs font-semibold text-[var(--color-text-gray)] hover:text-white">
            ← GTS Hub
          </Link>
        </div>
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-sm text-[var(--color-text-gray)]">{description}</p>
        </div>

        {res.data.length === 0 ? (
          <p className="text-sm text-[var(--color-text-gray)]">Nothing published here yet - check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {res.data.map((item) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ContentCard key={item._id} contentType={contentType} data={toCardData(contentType, item as any)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
