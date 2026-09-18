import Link from "next/link"

import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

export default function CustomizeFallbackPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />

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
    </div>
  )
}
