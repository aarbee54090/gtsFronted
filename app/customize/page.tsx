import type { Metadata } from "next"
import Link from "next/link"

import { brandTitle, pageMetadata } from "@/lib/seo"

// Thin fallback that only points to /products - kept out of the index (and
// the sitemap) so it doesn't compete with the real products page; links on
// it are still followed.
export const metadata: Metadata = pageMetadata({
  title: brandTitle("Customize Your Sportswear"),
  description: "Start designing custom team sportswear with GoalThali Sports - pick a product category to choose your sport and design.",
  noindex: true,
})

export default function CustomizeFallbackPage() {
  return (
    <>
      <div className="flex flex-col items-center gap-4 px-6 pt-32 pb-24 text-center">
        <h1 className="text-2xl font-bold">Choose a product to start</h1>
        <p className="max-w-md text-sm text-[var(--color-text-gray)]">
          Pick a category from the homepage to begin customizing.
        </p>
        <Link
          href="/products"
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)]"
        >
          Browse Products
        </Link>
      </div>
    </>
  )
}
