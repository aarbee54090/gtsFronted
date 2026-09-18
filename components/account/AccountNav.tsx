"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/saved-designs", label: "Saved Designs" },
  { href: "/account/saved-orders", label: "Saved Orders" },
  { href: "/account/settings", label: "Settings" },
]

export function AccountNav() {
  const pathname = usePathname()
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-semibold transition-colors ${
              active
                ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
                : "border-[var(--glass-border)] text-[var(--color-text-gray)] hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
