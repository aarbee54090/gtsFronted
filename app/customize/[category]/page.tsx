import Image from "next/image"
import { Navbar } from "@/components/landing/Navbar"
import { SportPicker } from "@/components/customize/SportPicker"
import { fetchProductsByCategory } from "@/lib/api"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: rawCategory } = await params
  const category = decodeURIComponent(rawCategory) // Next.js does NOT auto-decode this
  const sports = await fetchProductsByCategory(category)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      {/* Full-bleed showroom backdrop, same hero photo used on the homepage -
          darkened enough that text/cards on top stay fully readable. */}
      <div className="pointer-events-none absolute inset-0">
        <Image src="/images/hero-bg-desktop.webp" alt="" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-dark)]/60 via-[var(--color-bg-dark)]/85 to-[var(--color-bg-dark)]" />
      </div>
      <AmbientBackground />
      <Navbar />

      <div className="relative mx-auto max-w-[1100px] px-6 pb-24 pt-32">
        <SportPicker
          categorySlug={encodeURIComponent(category)}
          categoryName={category}
          sports={sports}
        />
      </div>
    </div>
  )
}
