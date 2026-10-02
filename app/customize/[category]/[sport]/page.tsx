import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { DesignSelectionStep } from "@/components/customize/DesignSelectionStep"
import { ProductOverview, type OverviewLink } from "@/components/customize/ProductOverview"
import { ViewPricingButton } from "@/components/customize/ViewPricingButton"
import { MOCK_PRODUCTS, sportToSlug } from "@/lib/mock-products"
import {
  fetchProductByCategorySport,
  fetchProductsByCategory,
  getContactInfo,
  getPublishedList,
} from "@/lib/api"
import { decodeRouteParam } from "@/lib/route-params"
import type { Design, PricingTier } from "@/lib/types"
import type { Material, NewArrival, PortfolioProject } from "@/lib/gts-hub-types"
import { HUB_BASE_PATH } from "@/lib/gts-hub-card-helpers"
import { JsonLd } from "@/components/seo/JsonLd"
import { CURRENCY } from "@/lib/money"
import {
  categoryPageCopy,
  designsSentence,
  lowestPrice,
  priceSummary,
  productMetaDescription,
  productPageCopy,
} from "@/lib/product-seo"
import { sportKey } from "@/lib/sports"
import { brandTitle, customizePath, pageMetadata, usableImageUrl } from "@/lib/seo"
import { breadcrumbNode, jsonLd, type Crumb } from "@/lib/structured-data"
import { tidyIfLowercase } from "@/lib/text"

interface SportPageProps {
  params: Promise<{ category: string; sport: string }>
  searchParams: Promise<{ design?: string }>
}

export async function generateMetadata({ params }: SportPageProps): Promise<Metadata> {
  const { category: rawCategory, sport: rawSport } = await params
  const category = decodeRouteParam(rawCategory)
  const sport = decodeRouteParam(rawSport)
  if (category === null || sport === null) notFound()
  const realProduct = await fetchProductByCategorySport(category, sport)

  if (!realProduct) {
    return pageMetadata({
      title: brandTitle(`Custom ${category}`),
      description: `Design a custom ${category} with GoalThali Sports.`,
      noindex: true,
    })
  }

  const copy = productPageCopy(realProduct)
  const image = usableImageUrl(realProduct.thumbnailImageUrl)

  return pageMetadata({
    title: copy.title,
    description: productMetaDescription(copy, realProduct.designs.length, (realProduct.pricingTiers ?? []).length > 0),
    // Built from the stored names, so ?design=... selections and variants
    // of the sport segment (it's matched as a slug, in any letter case) all
    // point at one URL.
    path: customizePath(realProduct.category, realProduct.sport),
    images: image ? [{ url: image, alt: copy.heading }] : undefined,
  })
}

/** Our Work projects, new arrivals, and fabrics the CMS tags with this sport. */
async function relatedLinks(sport: string): Promise<OverviewLink[]> {
  const key = sportKey(sport)
  const matches = (value: string | undefined) => !!value && sportKey(value) === key
  const [projects, arrivals, materials] = await Promise.all([
    getPublishedList<PortfolioProject>("/portfolio", { limit: "50" }).then((r) => r.data, () => []),
    getPublishedList<NewArrival>("/new-arrivals", { limit: "50" }).then((r) => r.data, () => []),
    getPublishedList<Material>("/materials", { limit: "50" }).then((r) => r.data, () => []),
  ])

  return [
    ...projects
      .filter((p) => matches(p.sport))
      .slice(0, 3)
      .map((p) => ({ href: `${HUB_BASE_PATH.portfolio}/${p.slug}`, label: tidyIfLowercase(p.title) })),
    ...arrivals
      .filter((a) => matches(a.sport))
      .slice(0, 2)
      .map((a) => ({ href: `${HUB_BASE_PATH["new-arrival"]}/${a.slug}`, label: `New designs: ${tidyIfLowercase(a.title)}` })),
    ...materials
      .filter((m) => (m.suitableFor ?? []).some(matches))
      .slice(0, 2)
      .map((m) => ({ href: `${HUB_BASE_PATH.material}/${m.slug}`, label: `Fabric: ${tidyIfLowercase(m.name)}` })),
  ]
}

export default async function SportPage({ params, searchParams }: SportPageProps) {
  const { category: rawCategory, sport: rawSport } = await params
  const { design: initialDesignId } = await searchParams
  const category = decodeRouteParam(rawCategory) // Next.js does NOT auto-decode this
  const sport = decodeRouteParam(rawSport)
  if (category === null || sport === null) notFound()
  const realProduct = await fetchProductByCategorySport(category, sport)

  if (!realProduct) {
    return (
      <>
        <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="max-w-md text-sm text-[var(--color-text-gray)]">
              We couldn&apos;t find that combination of product and sport.
            </p>
            <Link
              href="/products"
              className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)]"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </>
    )
  }

  const [siblings, related, contact] = await Promise.all([
    fetchProductsByCategory(realProduct.category),
    relatedLinks(realProduct.sport),
    getContactInfo().catch(() => null),
  ])

  // Real designs (with real Cloudinary imageUrls and admin-set prices) from
  // the backend, adapted to the shape DesignPicker/DesignSelectionStep expect.
  const realDesigns: Design[] = realProduct.designs.map((d) => ({
    id: d._id ?? d.name,
    name: d.name,
    sport: realProduct.sport,
    imageUrl: d.imageUrl,
    price: d.price,
  }))

  // Fabric pricing isn't connected to the real backend yet (Phase 2 data
  // lives separately) - reuse the mock template for that field only, with
  // real designs (and their real prices) substituted in.
  const productForCustomizer = {
    ...MOCK_PRODUCTS["jersey-kit"],
    designs: realDesigns,
  }

  const realPricingTiers: PricingTier[] = (realProduct.pricingTiers ?? []).map((t) => ({
    id: t._id ?? `${t.minQty}-${t.maxQty}`,
    minQty: t.minQty,
    maxQty: t.maxQty,
    price: t.price,
  }))

  const copy = productPageCopy(realProduct)
  // A category with a single product has no picker worth visiting (it's
  // noindex'd) - such products link back to all products instead.
  const hasSiblings = siblings.length > 1
  const categoryCopy = categoryPageCopy(
    realProduct.category,
    siblings.map((s) => s.sport)
  )
  const trail: Crumb[] = [
    { name: "Products", path: "/products" },
    ...(hasSiblings ? [{ name: categoryCopy.heading, path: customizePath(realProduct.category) }] : []),
    { name: copy.heading, path: customizePath(realProduct.category, realProduct.sport) },
  ]

  return (
    <>
      <JsonLd data={jsonLd(breadcrumbNode(trail))} />

      <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Link
              href={hasSiblings ? `/customize/${encodeURIComponent(category)}` : "/products"}
              className="mb-3 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
            >
              {hasSiblings ? "← Change sport" : "← All products"}
            </Link>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-brand-green)]">
              {copy.eyebrow}
            </p>
            <h1 className="display-lg">{copy.heading}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-gray)] sm:text-base">
              {copy.intro} {designsSentence(copy, realDesigns.length)}
            </p>
          </div>
          <ViewPricingButton designs={realDesigns} pricingTiers={realPricingTiers} currency={CURRENCY} />
        </div>
        <DesignSelectionStep
          product={productForCustomizer}
          categoryId={encodeURIComponent(category)}
          // The product's own slug, not whatever variant was typed in the
          // URL - the next steps and the order record all use this one.
          sportSlug={sportToSlug(realProduct.sport)}
          initialDesignId={initialDesignId}
          designNoun={copy.noun}
        />

        <ProductOverview
          copy={copy}
          designCount={realDesigns.length}
          fromPrice={lowestPrice(realPricingTiers)}
          prices={priceSummary(realPricingTiers)}
          related={related}
          whatsapp={contact?.whatsapp}
        />
      </div>
    </>
  )
}
