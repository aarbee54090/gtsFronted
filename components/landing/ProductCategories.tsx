"use client"

import { Suspense, use } from "react"

import type { ProductCard } from "@/lib/catalog"
import { ProductTile, productGridClass } from "@/components/products/ProductTile"

interface ProductCategoriesProps {
  // Started server-side (app/products/page.tsx) and streamed in: the heading
  // shows straight away, and the cards and their links still arrive in the
  // server-rendered HTML. Each card already knows which category it opens
  // (lib/catalog.ts).
  productCards: Promise<ProductCard[]>
}

export function ProductCategories({ productCards }: ProductCategoriesProps) {
  return (
    <section id="products" className="container-site page-top pb-16 sm:pb-24">
      <div className="mb-10 flex max-w-3xl flex-col gap-3 sm:mb-12">
        {/* Page heading for /products - the eyebrow line is part of the h1
            so it names what's here. */}
        <h1 className="display-lg">
          <span className="eyebrow mb-3 block">Custom Sportswear &amp; Team Uniforms in Nepal</span>
          Built for every team, <span className="text-[var(--color-brand-green)]">every sport</span>
        </h1>
        <p className="lead">
          Choose a product to start. You&apos;ll pick the sport and design next, then customize it and see your price
          before you order.
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductCards productCards={productCards} />
      </Suspense>
    </section>
  )
}

function ProductGridSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton aspect-[4/5]" />
      ))}
    </div>
  )
}

function ProductCards({ productCards: productCardsPromise }: ProductCategoriesProps) {
  const mainProducts = use(productCardsPromise)

  if (mainProducts.length === 0) {
    return <p className="text-sm text-[var(--color-text-gray)]">No products available yet.</p>
  }

  return (
    <div className={productGridClass(mainProducts.length)}>
      {mainProducts.map((item) => (
        <ProductTile key={item._id} item={item} />
      ))}
    </div>
  )
}
