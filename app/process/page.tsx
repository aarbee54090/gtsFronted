import { Navbar } from "@/components/landing/Navbar"
import { Process } from "@/components/landing/Process"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

export default function ProcessPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="pt-24">
        <Process />
      </div>
    </div>
  )
}
