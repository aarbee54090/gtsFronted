"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"
import { ProfileMenu } from "@/components/account/ProfileMenu"
import { Button } from "@/components/ui/button"

export const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/gts-hub/portfolio", label: "Our Work" },
  { href: "/process", label: "How It Works" },
  { href: "/gts-hub", label: "GTS Hub" },
  { href: "/gts-hub/contact", label: "Contact" },
]

const TRACK_LINK = { href: "/track", label: "Track Order" }

/**
 * The one nav link the current page belongs to: the longest href the path
 * starts with, so /gts-hub/portfolio/x marks "Our Work", not "GTS Hub".
 * /customize/* is reached from the product cards, so it counts as Products.
 */
export function activeNavHref(pathname: string | null): string | null {
  if (!pathname) return null
  if (pathname.startsWith("/customize")) return "/products"
  let best: string | null = null
  for (const { href } of [...NAV_LINKS, TRACK_LINK]) {
    const matches = pathname === href || pathname.startsWith(`${href}/`)
    if (matches && (!best || href.length > best.length)) best = href
  }
  return best
}

export function Navbar() {
  const pathname = usePathname()
  // The menu belongs to the page it was opened on: navigating anywhere
  // (a link, the back button) closes it without an effect.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const mobileOpen = menuOpenOn !== null && menuOpenOn === pathname
  const closeMenu = () => setMenuOpenOn(null)
  const active = activeNavHref(pathname)

  // A touch more opaque once content scrolls under the bar.
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpenOn(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <div
        className={`glass-3 mx-auto flex max-w-[var(--container)] items-center justify-between gap-4 rounded-full py-2.5 pl-5 pr-2.5 transition-colors duration-300 ${
          isScrolled || mobileOpen ? "" : "bg-[var(--glass-bg-soft)] shadow-none"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center" onClick={closeMenu}>
          <Image
            src="/images/gts-logo.png"
            alt="GoalThali Sports"
            width={112}
            height={83}
            loading="eager"
            className="h-7 w-auto"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-6 p-0 xl:gap-7">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} label={link.label} active={active === link.href} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <span className="hidden xl:inline">
            <NavLink href={TRACK_LINK.href} label={TRACK_LINK.label} active={active === TRACK_LINK.href} />
          </span>
          <ProfileMenu />
          <Button asChild size="sm">
            <Link href="/products">
              Start Customizing <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpenOn(mobileOpen ? null : pathname)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="glass-3 mx-auto mt-2 max-h-[calc(100dvh-6rem)] max-w-[var(--container)] overflow-y-auto rounded-[var(--radius-xl)] p-3 lg:hidden"
        >
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {[...NAV_LINKS, TRACK_LINK].map((link) => {
              const isActive = active === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-[var(--radius-md)] px-3 text-[15px] font-semibold transition-colors hover:bg-white/[0.06] ${
                      isActive ? "text-[var(--color-brand-green)]" : "text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-2 flex flex-col gap-3 border-t border-[var(--color-line)] px-3 pb-1 pt-3">
            <ProfileMenu onNavigate={closeMenu} variant="menu" />
            <Button asChild className="w-full">
              <Link href="/products" onClick={closeMenu}>
                Start Customizing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex min-h-10 items-center whitespace-nowrap text-sm font-medium leading-none transition-colors xl:text-[15px] ${
        active ? "text-white" : "text-[var(--color-text-gray)] hover:text-white"
      }`}
    >
      {label}
      {/* A short bar under the current section - present, not loud. */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-[var(--color-brand-green)]"
        />
      )}
    </Link>
  )
}
