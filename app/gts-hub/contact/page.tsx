import type { Metadata } from "next"
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { ContactForm } from "@/components/gts-hub/ContactForm"
import { getContactInfo } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"

export async function generateMetadata(): Promise<Metadata> {
  const info = await getContactInfo()
  return buildMetadata({
    seo: info?.seo,
    fallbackTitle: "Contact Us",
    fallbackDescription: "Get in touch with GTS.",
  })
}

export default async function ContactPage() {
  const info = await getContactInfo()

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />

      <div className="mx-auto max-w-[900px] px-6 pb-24 pt-32">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
          Contact Us
        </p>
        <h1 className="mb-10 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">Get in Touch</h1>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            {info?.phone && (
              <a href={`tel:${info.phone}`} className="flex items-center gap-3 text-sm text-white hover:text-[var(--color-brand-green)]">
                <Phone className="h-5 w-5 shrink-0 text-[var(--color-brand-green)]" />
                {info.phone}
              </a>
            )}
            {info?.email && (
              <a href={`mailto:${info.email}`} className="flex items-center gap-3 text-sm text-white hover:text-[var(--color-brand-green)]">
                <Mail className="h-5 w-5 shrink-0 text-[var(--color-brand-green)]" />
                {info.email}
              </a>
            )}
            {info?.whatsapp && (
              <a
                href={`https://wa.me/${info.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-white hover:text-[var(--color-brand-green)]"
              >
                <MessageCircle className="h-5 w-5 shrink-0 text-[var(--color-brand-green)]" />
                Chat on WhatsApp
              </a>
            )}
            {info?.address && (
              <p className="flex items-center gap-3 text-sm text-white">
                <MapPin className="h-5 w-5 shrink-0 text-[var(--color-brand-green)]" />
                {info.address}
              </p>
            )}

            {!info && (
              <p className="text-sm text-[var(--color-text-gray)]">Contact details haven&apos;t been set up yet.</p>
            )}

            {info?.mapEmbedUrl && (
              <iframe
                src={info.mapEmbedUrl}
                className="mt-2 h-64 w-full rounded-[var(--radius-lg)] border border-[var(--glass-border)]"
                loading="lazy"
                title="Location map"
              />
            )}
          </div>

          <div className="glass-2 rounded-[var(--radius-lg)] p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Send a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
