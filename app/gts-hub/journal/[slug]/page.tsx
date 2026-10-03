import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteShell } from "@/components/site/SiteShell"
import { HubBreadcrumbs } from "@/components/gts-hub/HubBreadcrumbs"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { RelatedContentSection } from "@/components/gts-hub/RelatedContentSection"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { JsonLd } from "@/components/seo/JsonLd"
import { getBySlug } from "@/lib/api"
import { HUB_BASE_PATH } from "@/lib/gts-hub-card-helpers"
import { buildMetadata, firstImageUrl, hubDescription, hubTrail } from "@/lib/gts-hub-metadata"
import type { JournalArticle } from "@/lib/gts-hub-types"
import { brandTitle, stripHtml } from "@/lib/seo"
import { blogPostingNode, breadcrumbNode, jsonLd } from "@/lib/structured-data"

interface PageProps {
  params: Promise<{ slug: string }>
}

const articlePath = (article: JournalArticle) => `${HUB_BASE_PATH.journal}/${article.slug}`
const fallbackDescription = (article: JournalArticle) => article.excerpt || stripHtml(article.content)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const res = await getBySlug<JournalArticle>("/journal", slug)
  if (!res) return { title: brandTitle("Journal") }
  const article = res.data
  return buildMetadata({
    seo: article.seo,
    fallbackTitle: article.title,
    fallbackDescription: fallbackDescription(article),
    path: articlePath(article),
    images: [article.coverImage],
    article: { publishedTime: article.publishedAt, modifiedTime: article.updatedAt, section: article.category },
  })
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { slug } = await params
  const res = await getBySlug<JournalArticle>("/journal", slug)
  if (!res) notFound()
  const article = res.data
  const path = articlePath(article)
  const trail = hubTrail("journal")

  return (
    <SiteShell>
      <JsonLd
        data={jsonLd(
          breadcrumbNode([...trail, { name: article.title, path }]),
          blogPostingNode({
            path,
            headline: article.title,
            description: hubDescription(article.seo, fallbackDescription(article)),
            image: firstImageUrl([article.coverImage, article.seo?.ogImage]),
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: article.author,
            section: article.category,
            keywords: article.tags,
          })
        )}
      />
      <article className="page-top mx-auto w-full max-w-3xl px-[var(--gutter)] pb-20">
        <HubBreadcrumbs crumbs={trail} />
        <div className="eyebrow mb-4 flex flex-wrap items-center gap-2">
          {article.category}
        </div>
        <h1 className="display-lg mb-3">{article.title}</h1>
        <p className="mb-8 text-xs text-[var(--color-text-gray)]">
          By {article.author || "GTS"}
          {article.publishedAt && (
            <>
              {" · "}
              <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString()}</time>
            </>
          )}
        </p>

        {article.coverImage?.url && (
          <HubMedia
            media={article.coverImage}
            fallbackAlt={article.title}
            className="mb-8 w-full rounded-[var(--radius-lg)] object-cover"
          />
        )}

        {article.content && (
          // Admin-authored HTML from the Tiptap editor, not user-generated -
          // safe to render directly.
          <div
            className="prose-gts mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        <div className="mb-12">
          <ContextualCTA />
        </div>

        <RelatedContentSection related={res.related} />
      </article>
    </SiteShell>
  )
}
