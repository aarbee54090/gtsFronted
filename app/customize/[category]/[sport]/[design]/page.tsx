import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Customizer } from "@/components/customize/Customizer"
import { MOCK_PRODUCTS, sportToSlug } from "@/lib/mock-products"
import { fetchProductByCategorySport, fetchAddons } from "@/lib/api"
import { decodeRouteParam } from "@/lib/route-params"
import { brandTitle, pageMetadata } from "@/lib/seo"

interface DesignPageProps {
  params: Promise<{ category: string; sport: string; design: string }>
}

// One URL per design per visitor - a configurator step, not a landing page,
// so it stays out of the index (links are still followed).
export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
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

  return pageMetadata({
    title: brandTitle(`Customize ${realProduct.name}`),
    description: `Set fabric, fit, addons, and quantity for your ${realProduct.name} and get instant pricing from GoalThali Sports.`,
    noindex: true,
  })
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { category: rawCategory, sport: rawSport, design: rawDesign } = await params
  const category = decodeRouteParam(rawCategory) // Next.js does NOT auto-decode this
  const sport = decodeRouteParam(rawSport)
  const designId = decodeRouteParam(rawDesign)
  if (category === null || sport === null || designId === null) notFound()
  const [realProduct, realAddons] = await Promise.all([
    fetchProductByCategorySport(category, sport),
    fetchAddons(),
  ])

  if (!realProduct) {
    return (
      <>
        <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="max-w-md text-sm text-[var(--color-text-gray)]">
              We couldn&apos;t find that combination of product, sport, and design.
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

  // Resolve the actual chosen design (with its real image and admin-set
  // price) from the real product's design list.
  const matchedDesign = realProduct.designs.find((d) => d._id === designId)
  const selectedDesign =
    designId === "custom-upload"
      ? { name: "Your uploaded design" }
      : matchedDesign
        ? { name: matchedDesign.name, imageUrl: matchedDesign.imageUrl, price: matchedDesign.price }
        : null

  // Fabric pricing isn't connected to the real backend yet - reuse the mock
  // template for that field, with real designs (and their real prices)
  // substituted in (same approach as the design-gallery page).
  const productForCustomizer = {
    ...MOCK_PRODUCTS["jersey-kit"],
    // The real product's identity - the template's own name ("Football
    // Jersey Kit") used to end up on every order, whatever was customized.
    id: realProduct._id,
    name: realProduct.name,
    category: realProduct.category,
    designs: realProduct.designs.map((d) => ({
      id: d._id ?? d.name,
      name: d.name,
      sport: realProduct.sport,
      imageUrl: d.imageUrl,
      price: d.price,
    })),
    pricingTiers: (realProduct.pricingTiers ?? []).map((t) => ({
      id: t._id ?? `${t.minQty}-${t.maxQty}`,
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.price,
    })),
    // Real, admin-managed addons once any exist; otherwise keep the mock
    // Shorts/Track placeholders so the step doesn't just go blank.
    addons: realAddons.length > 0 ? realAddons : MOCK_PRODUCTS["jersey-kit"].addons,
  }

  // The product's own slug rather than the URL variant - used for the back
  // link and carried into the quotation, checkout, and order record.
  const sportSlug = sportToSlug(realProduct.sport)

  return (
    <>
      <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
        <div className="mb-8">
          <Link
            href={`/customize/${encodeURIComponent(category)}/${sportSlug}`}
            className="mb-3 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
          >
            ← Change design
          </Link>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-brand-green)]">
            {realProduct.sport} {realProduct.category}
          </p>
          <h1 className="display-lg">{realProduct.name}</h1>
        </div>
        <Customizer
          product={productForCustomizer}
          selectedDesign={selectedDesign}
          categoryId={encodeURIComponent(category)}
          sportSlug={sportSlug}
        />
      </div>
    </>
  )
}
