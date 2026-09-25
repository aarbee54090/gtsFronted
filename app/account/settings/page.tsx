"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Card } from "@/components/customize/Card"
import { RequireCustomer } from "@/components/account/RequireCustomer"
import { AccountNav } from "@/components/account/AccountNav"
import { useCustomerAuth, ApiError } from "@/components/account/CustomerAuthContext"
import { apiFetch } from "@/lib/api"
import type { Customer } from "@/lib/customer-types"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

function SettingsForm() {
  const { customer, refresh, logout } = useCustomerAuth()
  const router = useRouter()
  const [name, setName] = useState(customer?.name ?? "")
  const [address, setAddress] = useState(customer?.address ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!customer) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await apiFetch<{ success: boolean; data: Customer }>("/customers/me", {
        method: "PUT",
        body: { name, address },
      })
      await refresh()
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes.")
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
          Edit Details
        </h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="settings-name" className="text-sm font-semibold text-white">Name</label>
            <input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">Phone</label>
            <input value={customer.phone} disabled className={`${inputClasses} cursor-not-allowed opacity-60`} />
            <p className="text-xs text-[var(--color-text-gray)]">
              Your phone number is how you log in and can&apos;t be changed here.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="settings-address" className="text-sm font-semibold text-white">Address</label>
            <textarea
              id="settings-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={`${inputClasses} resize-none`}
            />
          </div>

          {error && (
            <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
              {error}
            </p>
          )}
          {saved && <p className="text-sm text-[var(--color-brand-green)]">Saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Card>

      <button
        type="button"
        onClick={handleLogout}
        className="self-start rounded-[var(--radius-pill)] border border-[var(--color-error-red)] px-6 py-3 text-sm font-bold text-[var(--color-error-red)]"
      >
        Logout
      </button>
    </div>
  )
}

export default function AccountSettingsPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[640px] px-6 pb-24 pt-32">
        <h1 className="mb-6 text-3xl font-bold text-white">Account Settings</h1>
        <RequireCustomer>
          <AccountNav />
          <SettingsForm />
        </RequireCustomer>
      </div>
    </div>
  )
}
