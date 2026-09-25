"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { User, ChevronDown } from "lucide-react"
import { useCustomerAuth } from "@/components/account/CustomerAuthContext"

const MENU_LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/saved-designs", label: "Saved Designs" },
  { href: "/account/saved-orders", label: "Saved Orders" },
  { href: "/account/settings", label: "Account Settings" },
]

export function ProfileMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { customer, loading, logout } = useCustomerAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (loading) return null

  if (!customer) {
    return (
      <Link
        href={`/account/register?redirect=${encodeURIComponent(pathname)}`}
        onClick={onNavigate}
        className="text-sm font-medium text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
      >
        Profile
      </Link>
    )
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
      >
        <User className="h-4 w-4" />
        {customer.name.split(" ")[0]}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {/* Near-solid base on purpose: this renders inside the navbar's glass
          (the pill, or the mobile menu panel), whose own backdrop-filter
          makes it the dropdown's backdrop root - so the dropdown can only
          blur the navbar, not the page under it, and a see-through base
          would show unblurred page text through it. */}
      {open && (
        <div className="glass-3 absolute right-0 top-full mt-2 w-52 rounded-[var(--radius-md)] bg-[var(--glass-bg-solid)] p-2">
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--color-text-gray)] hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              onNavigate?.()
              await logout()
              router.push("/")
            }}
            className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-[var(--color-error-red)] hover:bg-white/[0.06]"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
