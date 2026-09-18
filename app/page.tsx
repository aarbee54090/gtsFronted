import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  )
}
