import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"

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

// Placeholder hrefs ("#") - swap these for your real profile URLs.
const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: FacebookIcon, label: "Facebook", href: "#" },
]

const WHATSAPP_NUMBER = "9779705743117"

export function Footer() {
  return (
    <footer className="px-4 py-6">
      <div className="glass-bevel mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-6 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-6 backdrop-blur-[16px] sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Image
            src="/images/goalthali-badge.png"
            alt="GoalThali Sports — Made in Nepal"
            width={220}
            height={70}
            className="h-12 w-auto"
          />
          <p className="text-xs text-[var(--color-text-gray)]">
            © {new Date().getFullYear()} GTS. All rights reserved.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex list-none items-center gap-6 p-0 text-sm">
            <li>
              <Link
                href="/gts-hub/about"
                className="text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/gts-hub/contact"
                className="text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="text-[var(--color-text-gray)] transition-colors hover:text-[var(--color-brand-green)]"
            >
              <social.icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
