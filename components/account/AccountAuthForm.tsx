"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCustomerAuth, ApiError } from "./CustomerAuthContext"
import { useSavedDesigns } from "./SavedDesignsContext"
import { apiFetch } from "@/lib/api"
import { takePendingAction } from "@/lib/pending-action"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

interface AccountAuthFormProps {
  mode: "register" | "login"
}

export function AccountAuthForm({ mode }: AccountAuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/account"
  const { register, login } = useCustomerAuth()
  const { toggleSave } = useSavedDesigns()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (mode === "register") {
        await register({ name, phone, address })
      } else {
        await login(phone)
      }

      // Complete whatever the guest was actually trying to do (save a
      // design, save an order-in-progress) before landing them back where
      // they started - otherwise the redirect alone would drop their intent
      // and they'd have to redo the click.
      const pending = takePendingAction()
      if (pending?.type === "save-design") {
        await toggleSave(pending)
      } else if (pending?.type === "save-order") {
        await apiFetch("/saved-orders", { method: "POST", body: { draft: pending.draft } }).catch(() => {})
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "register" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="acct-name" className="text-sm font-semibold text-white">
            Name
          </label>
          <input
            id="acct-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="acct-phone" className="text-sm font-semibold text-white">
          Phone number
        </label>
        <input
          id="acct-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98XXXXXXXX"
          className={inputClasses}
        />
        {mode === "login" && (
          <p className="text-xs text-[var(--color-text-gray)]">
            Just your number - no password needed.
          </p>
        )}
      </div>

      {mode === "register" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="acct-address" className="text-sm font-semibold text-white">
            Address
          </label>
          <textarea
            id="acct-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="Street, city, district"
            className={`${inputClasses} resize-none`}
          />
        </div>
      )}

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Please wait..." : mode === "register" ? "Create Account" : "Log In"}
      </button>

      <p className="text-center text-xs text-[var(--color-text-gray)]">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <Link href="/account/login" className="font-semibold text-[var(--color-brand-green)]">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/account/register" className="font-semibold text-[var(--color-brand-green)]">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
