"use client"

import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Card } from "@/components/customize/Card"
import { RequireCustomer } from "@/components/account/RequireCustomer"
import { AccountNav } from "@/components/account/AccountNav"
import { useCustomerAuth } from "@/components/account/CustomerAuthContext"

function AccountOverview() {
  const { customer } = useCustomerAuth()
  if (!customer) return null

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
        Account Details
      </h2>
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="text-xs text-[var(--color-text-gray)]">Name</p>
          <p className="font-semibold text-white">{customer.name}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-gray)]">Phone</p>
          <p className="font-semibold text-white">{customer.phone}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-gray)]">Address</p>
          <p className="font-semibold text-white">{customer.address}</p>
        </div>
      </div>
    </Card>
  )
}

export default function AccountPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-32">
        <h1 className="mb-6 text-3xl font-bold text-white">My Account</h1>
        <RequireCustomer>
          <AccountNav />
          <AccountOverview />
        </RequireCustomer>
      </div>
    </div>
  )
}
