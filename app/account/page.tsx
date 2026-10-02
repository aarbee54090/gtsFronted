"use client"

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
    <>
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-32">
        <h1 className="display-lg mb-6">My Account</h1>
        <RequireCustomer>
          <AccountNav />
          <AccountOverview />
        </RequireCustomer>
      </div>
    </>
  )
}
