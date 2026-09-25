import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { getBySlug } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"
import type { JournalArticle } from "@/lib/gts-hub-types"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<JournalArticle>("/journal", slug)
  if (!res) return { title: "Journal | GTS Hub" }
  return buildMetadata({
    seo: res.data.seo,
    fallbackTitle: res.data.title,
    fallbackDescription: res.data.excerpt,
  })
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<JournalArticle>("/journal", slug)
  if (!res) notFound()
  const article = res.data

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <article className="mx-auto max-w-[800px] px-4 pb-20 pt-24">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-brand-green)]">
          {article.category}
        </div>
        <h1 className="mb-3 text-3xl font-bold text-white">{article.title}</h1>
        <p className="mb-8 text-xs text-[var(--color-text-gray)]">
          By {article.author || "GTS"}
          {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ""}
        </p>

        {article.coverImage?.url && (
          <HubMedia media={article.coverImage} className="mb-8 w-full rounded-[var(--radius-lg)] object-cover" />
        )}

        {article.content && (
          // Admin-authored HTML from the Tiptap editor, not user-generated -
          // safe to render directly.
          <div
            className="prose prose-invert prose-sm mb-12 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        <div className="mb-12">
          <ContextualCTA />
        </div>

        <RelatedContentSection related={res.related} />
      </article>
    </div>
  )
}
