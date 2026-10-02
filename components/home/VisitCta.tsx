import Link from "next/link"
import { CalendarDays, MapPin, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ContactInfo } from "@/lib/contact-types"
import { formatAddress } from "@/lib/contact"
import { telLink, whatsappLink } from "@/lib/site"

/** Closing call to action: book a visit, or reach GTS directly. */
export function VisitCta({ contact }: { contact: ContactInfo | null }) {
  const address = formatAddress(contact)

  return (
    <section aria-labelledby="visit-heading" className="section">
      <div className="container-site">
        <div className="surface-card relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-brand-green)]/10 blur-[80px]"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="flex flex-col gap-4">
              <p className="eyebrow">Visit GTS</p>
              <h2 id="visit-heading" className="display-md">
                Prefer to plan your kit in person?
              </h2>
              <p className="lead">
                Book a time to visit GTS and talk through your design, sizes, quantities, and deadline face to face.
              </p>
              {(address || contact?.openingHours) && (
                <p className="flex items-start gap-2 text-sm text-white/85">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                  <span>
                    {address}
                    {address && contact?.openingHours ? " · " : ""}
                    {contact?.openingHours}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg">
                <Link href="/gts-hub/contact#book-a-visit">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a Visit
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={whatsappLink(contact?.whatsapp)} target="_blank" rel="noreferrer" data-whatsapp-cta>
                  <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> WhatsApp
                </a>
              </Button>
              {contact?.phone && (
                <Button asChild size="lg" variant="outline">
                  <a href={telLink(contact.phone)}>
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call {contact.phone}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
