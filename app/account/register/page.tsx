import { Suspense } from "react"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Card } from "@/components/customize/Card"
import { AccountAuthForm } from "@/components/account/AccountAuthForm"

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[440px] px-6 pb-24 pt-32">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
            Create Account
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Join GTS</h1>
          <p className="mt-3 text-sm text-[var(--color-text-gray)]">
            Needed to place orders and save your favorite designs.
          </p>
        </div>
        <Card className="p-6">
          <Suspense fallback={null}>
            <AccountAuthForm mode="register" />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
