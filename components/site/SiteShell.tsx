import type { ReactNode } from "react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { WhatsAppButton } from "@/components/shared/WhatsAppButton"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { getContactInfo, getPublishedPlatforms } from "@/lib/api"
import type { ContactInfo } from "@/lib/contact-types"

/** Official profile URLs from the admin-managed Platforms list (GTS Hub). */
export async function loadProfileUrls(): Promise<string[]> {
  const platforms = await getPublishedPlatforms().catch(() => [])
  return platforms.map((platform) => platform.url).filter((url) => /^https?:\/\//i.test(url))
}

/**
 * The frame every public page shares: skip link, ambient backdrop, navbar,
 * footer (with the business's real contact details and social profiles),
 * and the floating WhatsApp button. Pages pass their content as children.
 *
 * The contact and platform lookups are the same cached fetches the pages
 * themselves use (Next deduplicates them within a render), and a backend
 * hiccup only leaves those details out - it never fails the page.
 */
export async function SiteShell({
  children,
  contact,
  floatingWhatsApp = true,
}: {
  children: ReactNode
  contact?: ContactInfo | null
  /** Off on pages with their own WhatsApp actions and forms the button could cover (Contact). */
  floatingWhatsApp?: boolean
}) {
  const [contactInfo, profileUrls] = await Promise.all([
    contact !== undefined ? Promise.resolve(contact) : getContactInfo().catch(() => null),
    loadProfileUrls(),
  ])

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AmbientBackground />
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer profileUrls={profileUrls} contact={contactInfo} />
      {floatingWhatsApp && <WhatsAppButton number={contactInfo?.whatsapp} />}
    </div>
  )
}
