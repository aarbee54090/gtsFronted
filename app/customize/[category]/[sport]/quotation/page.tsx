import { Navbar } from "@/components/landing/Navbar"
import { QuotationPage } from "@/components/customize/QuotationPage"
import { AmbientBackground } from "@/components/shared/AmbientBackground"

export default function Quotation() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-white">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[700px] px-6 pb-24 pt-32">
        <QuotationPage />
      </div>
    </div>
  )
}
