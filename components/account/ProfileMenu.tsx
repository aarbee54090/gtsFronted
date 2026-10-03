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

// "bar" sits in the desktop navbar next to the nav links and matches them;
// "menu" is a full-size row in the mobile menu panel, easy to tap.
const TRIGGER_CLASS = {
  bar: "inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap text-sm font-medium leading-none text-[var(--color-text-gray)] transition-colors hover:text-white xl:text-[15px]",
  menu: "flex min-h-11 w-full items-center gap-2 text-[15px] font-semibold text-white transition-colors hover:text-[var(--color-brand-green)]",
}

export function ProfileMenu({ onNavigate, variant = "bar" }: { onNavigate?: () => void; variant?: "bar" | "menu" }) {
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
        className={TRIGGER_CLASS[variant]}
      >
        Profile
      </Link>
    )
  }

  const inMenu = variant === "menu"
  const itemClass = `w-full rounded-[var(--radius-sm)] px-3 text-left hover:bg-white/[0.06] ${
    inMenu ? "flex min-h-11 items-center text-[15px]" : "block py-2 text-sm"
  }`

  return (
    <div ref={menuRef} className="relative">
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-expanded={open} className={TRIGGER_CLASS[variant]}>
        <User className="h-4 w-4" />
        {customer.name.split(" ")[0]}
        <ChevronDown className={`h-3.5 w-3.5 ${inMenu ? "ml-auto" : ""}`} />
      </button>

      {/* Near-solid base on purpose: this renders inside the navbar's glass
          (the pill, or the mobile menu panel), whose own backdrop-filter
          makes it the dropdown's backdrop root - so the dropdown can only
          blur the navbar, not the page under it, and a see-through base
          would show unblurred page text through it. In the mobile menu it
          opens in place, so it never runs past the bottom of the panel. */}
      {open && (
        <div
          className={`glass-3 rounded-[var(--radius-md)] bg-[var(--glass-bg-solid)] p-2 ${
            inMenu ? "mt-1" : "absolute right-0 top-full mt-2 w-52"
          }`}
        >
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={`${itemClass} text-[var(--color-text-gray)] hover:text-white`}
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
            className={`${itemClass} text-[var(--color-error-red)]`}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
