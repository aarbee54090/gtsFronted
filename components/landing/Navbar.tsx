"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { ProfileMenu } from "@/components/account/ProfileMenu"

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/gts-hub", label: "GTS Hub" },
  { href: "/process", label: "Process" },
  { href: "/book-appointment", label: "Book an Appointment" },
  { href: "/track", label: "Track Order" },
]

// /customize/* isn't nested under /products in the URL, but it's reached
// only by picking a product category there - so it counts as "Products" too.
function isNavLinkActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (pathname === href || pathname.startsWith(`${href}/`)) return true
  if (href === "/products" && pathname.startsWith("/customize")) return true
  return false
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Subtle glass transition once the page scrolls - a touch more opaque/
  // blurred + a soft shadow, so the bar feels "activated" over content
  // instead of a static shape floating on top of it.
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      role="banner"
      className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-[1100px] px-4"
    >
      <div
        className={`glass-bevel flex items-center justify-between rounded-full border border-[var(--glass-border)] px-5 py-3 backdrop-blur-[16px] transition-all duration-300 ${
          isScrolled ? "bg-[var(--glass-bg-strong)] shadow-[0_8px_32px_rgba(0,0,0,0.35)]" : "bg-[var(--glass-bg)]"
        }`}
      >
        <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <Image
            src="/images/gts-logo.png"
            alt="GTS"
            width={112}
            height={83}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-10 list-none m-0 p-0">
            {NAV_LINKS.map((link) => {
              const isActive = isNavLinkActive(pathname, link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative pb-1 text-sm font-medium transition-colors ${
                      isActive ? "text-[var(--color-brand-green)]" : "text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--color-brand-green)] shadow-[0_0_8px_rgba(182,255,0,0.7)]" />
                    )}
                  </Link>
                </li>
              )
            })}
            <li>
              <ProfileMenu />
            </li>
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="text-white md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="mt-2 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/95 p-4 backdrop-blur-[16px] md:hidden"
        >
          <ul className="flex flex-col gap-1 list-none m-0 p-0">
            {NAV_LINKS.map((link) => {
              const isActive = isNavLinkActive(pathname, link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium transition-colors hover:bg-black/20 hover:text-[var(--color-brand-green)] ${
                      isActive ? "text-[var(--color-brand-green)]" : "text-[var(--color-text-gray)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
            <li className="border-t border-[var(--glass-border)] pt-2">
              <ProfileMenu onNavigate={() => setMobileOpen(false)} />
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
