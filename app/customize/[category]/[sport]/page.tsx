import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/landing/Navbar"
import { DesignSelectionStep } from "@/components/customize/DesignSelectionStep"
import { ViewPricingButton } from "@/components/customize/ViewPricingButton"
import { MOCK_PRODUCTS } from "@/lib/mock-products"
import { fetchProductByCategorySport } from "@/lib/api"
import type { Design, PricingTier } from "@/lib/types"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface SportPageProps {
  params: Promise<{ category: string; sport: string }>
  searchParams: Promise<{ design?: string }>
}

export async function generateMetadata({ params }: SportPageProps): Promise<Metadata> {
  const { category: rawCategory, sport: sportSlug } = await params
  const category = decodeURIComponent(rawCategory)
  const realProduct = await fetchProductByCategorySport(category, sportSlug)

  if (!realProduct) {
    return { title: `Custom ${category} | GTS`, description: `Design a custom ${category} with GTS.` }
  }

  return {
    title: `Custom ${realProduct.sport} ${realProduct.category} in Nepal | GTS`,
    description: `Browse real ${realProduct.sport.toLowerCase()} ${realProduct.category.toLowerCase()} designs and pricing, then customize fabric, fit, and quantity with GTS.`,
  }
}

export default async function SportPage({ params, searchParams }: SportPageProps) {
  const { category: rawCategory, sport: sportSlug } = await params
  const { design: initialDesignId } = await searchParams
  const category = decodeURIComponent(rawCategory) // Next.js does NOT auto-decode this
  const realProduct = await fetchProductByCategorySport(category, sportSlug)

  if (!realProduct) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-white">
        <AmbientBackground />
        <Navbar />
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
      </div>
    )
  }

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

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-white">
      <AmbientBackground />
      <Navbar />

      <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={`/customize/${encodeURIComponent(category)}`}
              className="mb-3 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
            >
              ← Change sport
            </Link>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-brand-green)]">
              {realProduct.sport} {realProduct.category}
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{realProduct.name}</h1>
          </div>
          <ViewPricingButton designs={realDesigns} pricingTiers={realPricingTiers} currency="₹" />
        </div>
        <DesignSelectionStep
          product={productForCustomizer}
          categoryId={encodeURIComponent(category)}
          sportSlug={sportSlug}
          initialDesignId={initialDesignId}
        />
      </div>
    </div>
  )
}
