import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { SportPicker } from "@/components/customize/SportPicker"
import { fetchProductsByCategory } from "@/lib/api"
import { decodeRouteParam } from "@/lib/route-params"
import { JsonLd } from "@/components/seo/JsonLd"
import { categoryPageCopy } from "@/lib/product-seo"
import { customizePath, pageMetadata } from "@/lib/seo"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: rawCategory } = await params
  const category = decodeRouteParam(rawCategory)
  if (category === null) notFound()
  const sports = await fetchProductsByCategory(category)
  const copy = categoryPageCopy(category, sports.map((s) => s.sport))

  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: customizePath(category),
    // Category lookups are exact, so an unknown (or mistyped) category renders
    // an empty picker - nothing worth indexing. A category with one product is
    // just a link to that product's page, which is the one indexed (the two
    // would otherwise compete for the same searches).
    noindex: sports.length <= 1,
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: rawCategory } = await params
  const category = decodeRouteParam(rawCategory) // Next.js does NOT auto-decode this
  if (category === null) notFound()
  const sports = await fetchProductsByCategory(category)
  const copy = categoryPageCopy(category, sports.map((s) => s.sport))

  return (
    <>
      {sports.length > 1 && (
        <JsonLd
          data={jsonLd(
            breadcrumbNode([
              { name: "Products", path: "/products" },
              { name: copy.heading, path: customizePath(category) },
            ])
          )}
        />
      )}
      {/* Full-bleed showroom backdrop, same hero photo used on the homepage -
          darkened enough that text/cards on top stay fully readable. */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <Image src="/images/hero-bg-desktop.webp" alt="" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-dark)]/60 via-[var(--color-bg-dark)]/85 to-[var(--color-bg-dark)]" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 pb-24 pt-32">
        <SportPicker
          categorySlug={encodeURIComponent(category)}
          sports={sports}
          heading={copy.heading}
          eyebrow={copy.eyebrow}
          prompt={copy.prompt}
        />
      </div>
    </>
  )
}
