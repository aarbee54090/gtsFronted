import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { CheckoutPage } from "@/components/customize/CheckoutPage"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

// Transactional step with no unique public content - kept out of search
// results the same way /admin and /account are.
export const metadata: Metadata = {
  title: "Checkout | GTS",
  robots: { index: false, follow: false },
}

export default function Checkout() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-white">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[700px] px-6 pb-24 pt-32">
        <CheckoutPage />
      </div>
    </div>
  )
}
