import { Suspense } from "react"
import { Card } from "@/components/customize/Card"
import { AccountAuthForm } from "@/components/account/AccountAuthForm"

export default function LoginPage() {
  return (
    <>
      <div className="mx-auto max-w-[440px] px-6 pb-24 pt-32">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
            Welcome Back
          </p>
          <h1 className="display-lg">Log In</h1>
          <p className="mt-3 text-sm text-[var(--color-text-gray)]">
            Enter your phone number to access your account.
          </p>
        </div>
        <Card className="p-6">
          <Suspense fallback={null}>
            <AccountAuthForm mode="login" />
          </Suspense>
        </Card>
      </div>
    </>
  )
}
