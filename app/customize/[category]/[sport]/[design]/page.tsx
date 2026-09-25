import type { Metadata } from "next"
import Link from "next/link"

import { Navbar } from "@/components/landing/Navbar"
import { Customizer } from "@/components/customize/Customizer"
import { MOCK_PRODUCTS } from "@/lib/mock-products"
import { fetchProductByCategorySport, fetchAddons } from "@/lib/api"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface DesignPageProps {
  params: Promise<{ category: string; sport: string; design: string }>
}

export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
  const { category: rawCategory, sport: sportSlug } = await params
  const category = decodeURIComponent(rawCategory)
  const realProduct = await fetchProductByCategorySport(category, sportSlug)

  if (!realProduct) {
    return { title: `Custom ${category} | GTS`, description: `Design a custom ${category} with GTS.` }
  }

  return {
    title: `Customize Your ${realProduct.sport} ${realProduct.category} | GTS`,
    description: `Set fabric, fit, addons, and quantity for your ${realProduct.sport.toLowerCase()} ${realProduct.category.toLowerCase()} and get instant pricing from GTS.`,
    robots: { index: false, follow: true },
  }
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { category: rawCategory, sport: sportSlug, design: designId } = await params
  const category = decodeURIComponent(rawCategory) // Next.js does NOT auto-decode this
  const [realProduct, realAddons] = await Promise.all([
    fetchProductByCategorySport(category, sportSlug),
    fetchAddons(),
  ])

  if (!realProduct) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-white">
        <AmbientBackground />
        <Navbar />
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
      </div>
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

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-white">
      <AmbientBackground />
      <Navbar />

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
          <h1 className="text-3xl font-extrabold sm:text-4xl">{realProduct.name}</h1>
        </div>
        <Customizer
          product={productForCustomizer}
          selectedDesign={selectedDesign}
          categoryId={encodeURIComponent(category)}
          sportSlug={sportSlug}
        />
      </div>
    </div>
  )
}
