"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useCustomerAuth } from "./CustomerAuthContext"

export function RequireCustomer({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useCustomerAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !customer) {
      router.replace(`/account/register?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [loading, customer, pathname, router])

  if (loading || !customer) {
    return <p className="text-center text-sm text-[var(--color-text-gray)]">Loading...</p>
  }

  return <>{children}</>
}
