import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import type { ContactInfo } from "@/lib/contact-types"
import { SITE_NAME, telLink, whatsappLink } from "@/lib/site"
import { formatAddress } from "@/lib/contact"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.29.2 2.29.2v2.5h-1.29c-1.27 0-1.67.79-1.67 1.6V12h2.84l-.45 2.88h-2.39v6.99A10 10 0 0 0 22 12z" />
    </svg>
  )
}

// Icons we can show, matched by host against the real profile URLs the admin
// publishes under GTS Hub > Our Platforms. A network with no published URL
// gets no icon - never a dead "#" link.
const SOCIAL_NETWORKS = [
  { icon: InstagramIcon, label: "Instagram", hosts: ["instagram.com"] },
  { icon: FacebookIcon, label: "Facebook", hosts: ["facebook.com", "fb.com"] },
]

function socialLinksFor(profileUrls: string[]) {
  return SOCIAL_NETWORKS.flatMap((network) => {
    const href = profileUrls.find((url) => {
      try {
        const host = new URL(url).hostname.replace(/^www\./, "")
        return network.hosts.some((h) => host === h || host.endsWith(`.${h}`))
      } catch {
        return false
      }
    })
    return href ? [{ ...network, href }] : []
  })
}

const FOOTER_COLUMNS = [
  {
    title: "Order",
    links: [
      { href: "/products", label: "Products" },
      { href: "/process", label: "How It Works" },
      { href: "/track", label: "Track Order" },
      { href: "/account", label: "My Account" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/gts-hub/portfolio", label: "Our Work" },
      { href: "/gts-hub/new-arrivals", label: "New Arrivals" },
      { href: "/gts-hub/materials", label: "Materials" },
      { href: "/gts-hub/journal", label: "Journal" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/gts-hub/about", label: "About Us" },
      { href: "/gts-hub/contact", label: "Contact Us" },
      { href: "/gts-hub/contact#book-a-visit", label: "Book a Visit" },
      { href: "/gts-hub", label: "GTS Hub" },
    ],
  },
]

export function Footer({ profileUrls = [], contact }: { profileUrls?: string[]; contact?: ContactInfo | null }) {
  const socialLinks = socialLinksFor(profileUrls)
  const address = formatAddress(contact)

  return (
    <footer className="mt-auto border-t border-[var(--color-line)] bg-black/30">
      {/* Phones: the three link columns sit side by side and the contact
          details wrap inline, so the footer stays short instead of stacking
          every list into one long column. */}
      <div className="container-site grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-[1.4fr_3fr] lg:gap-10 lg:py-16">
        <div className="flex flex-col gap-4 lg:gap-5">
          <Link href="/" className="w-fit">
            <Image
              src="/images/goalthali-badge.png"
              alt="GoalThali Sports — Made in Nepal"
              width={220}
              height={70}
              className="h-10 w-auto lg:h-12"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--color-text-gray)]">
            Custom team jerseys and sportswear, designed with you and made in Nepal.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5 text-sm lg:flex-col">
            {address && (
              <li className="flex items-start gap-2.5 text-[var(--color-text-gray)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                <span>{address}</span>
              </li>
            )}
            {contact?.phone && (
              <li>
                <a href={telLink(contact.phone)} className="flex items-center gap-2.5 text-[var(--color-text-gray)] hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
            )}
            <li>
              <a
                href={whatsappLink(contact?.whatsapp)}
                target="_blank"
                rel="noreferrer"
                data-whatsapp-cta
                className="flex items-center gap-2.5 text-[var(--color-text-gray)] hover:text-white"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                WhatsApp
              </a>
            </li>
            {contact?.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 break-all text-[var(--color-text-gray)] hover:text-white">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-x-4 lg:gap-x-10">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`${column.title} links`}>
              <h2 className="eyebrow mb-2 !text-white/60 lg:mb-4">{column.title}</h2>
              <ul className="flex flex-col lg:gap-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-[13px] leading-snug text-[var(--color-text-gray)] transition-colors hover:text-white sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="container-site flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 sm:py-6">
          <p className="text-xs text-[var(--color-text-gray)]">
            © {new Date().getFullYear()} {SITE_NAME} (GTS). All rights reserved.
          </p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${SITE_NAME} on ${social.label}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
