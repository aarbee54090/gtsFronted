import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Footer } from "@/components/landing/Footer"
import { WhatsAppButton } from "@/components/shared/WhatsAppButton"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

export default function Home() {
  return (
    <div className="relative isolate min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <Hero />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
