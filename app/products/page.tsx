import type { Metadata } from "next"
import Image from "next/image"
import { Navbar } from "@/components/landing/Navbar"
import { ProductCategories } from "@/components/landing/ProductCategories"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

export const metadata: Metadata = {
  title: "Custom Jerseys, Tracksuits & Team Sportswear | GTS",
  description:
    "Browse GTS's custom sportswear categories - jersey kits, tracksuits, hoodies, and gym wear - and start designing for your team, college, or company.",
}

export default function ProductsPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      {/* Full-bleed showroom backdrop, same hero photo used on the homepage -
          darkened enough that text/cards on top stay fully readable. */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <Image src="/images/hero-bg-desktop.webp" alt="" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-dark)]/60 via-[var(--color-bg-dark)]/85 to-[var(--color-bg-dark)]" />
      </div>
      <AmbientBackground />
      <Navbar />
      <div className="relative pt-24">
        <ProductCategories />
      </div>
    </div>
  )
}
