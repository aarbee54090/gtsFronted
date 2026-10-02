import type { Metadata } from "next"
import { CalendarDays, Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react"
import { BookVisit } from "@/components/contact/BookVisit"
import { ContactForm } from "@/components/gts-hub/ContactForm"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/seo/JsonLd"
import { getContactInfo } from "@/lib/api"
import { directionsUrl, formatAddress, mapEmbedSrc } from "@/lib/contact"
import { buildMetadata } from "@/lib/gts-hub-metadata"
import { telLink, whatsappLink } from "@/lib/site"
import { breadcrumbNode, jsonLd, localBusinessNode } from "@/lib/structured-data"

export async function generateMetadata(): Promise<Metadata> {
  const info = await getContactInfo().catch(() => null)
  return buildMetadata({
    seo: info?.seo,
    fallbackTitle: "Contact & Visit Us in Kathmandu",
    fallbackDescription:
      "Contact GoalThali Sports in Kathmandu about custom jerseys and team sportswear - WhatsApp, phone or email - or book a time to visit in person.",
    path: "/gts-hub/contact",
  })
}

const TRAIL = [
  { name: "GTS Hub", path: "/gts-hub" },
  { name: "Contact Us", path: "/gts-hub/contact" },
]

export default async function ContactPage() {
  const info = await getContactInfo().catch(() => null)
  const address = formatAddress(info)
  const directions = directionsUrl(info)
  const map = mapEmbedSrc(info?.mapEmbedUrl)
  const business = localBusinessNode(info)

  return (
    // No floating WhatsApp button here: the page has its own WhatsApp
    // actions, and the button would sit over the booking form on phones.
    <SiteShell contact={info} floatingWhatsApp={false}>
      <JsonLd data={business ? jsonLd(breadcrumbNode(TRAIL), business) : jsonLd(breadcrumbNode(TRAIL))} />
      <PageHeader
        crumbs={TRAIL.slice(0, 1)}
        eyebrow="Contact Us"
        title="Talk to GTS"
        description="Message us, call, or book a time to visit. We're happy to help you plan sizes, quantities, and designs."
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" variant="whatsapp">
            <a href={whatsappLink(info?.whatsapp)} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
          </Button>
          {info?.phone && (
            <Button asChild size="lg" variant="secondary">
              <a href={telLink(info.phone)}>
                <Phone className="h-4 w-4" aria-hidden="true" /> Call {info.phone}
              </a>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <a href="#book-a-visit">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a Visit
            </a>
          </Button>
        </div>
      </PageHeader>

      <div className="container-site flex flex-col gap-16 pb-20">
        {/* Where to find GTS: the address beside the map on wide screens, the
            map under it on phones. Calling and WhatsApp are the buttons above. */}
        <section
          aria-labelledby="visit-heading"
          className={`surface-card grid grid-cols-1 gap-5 p-5 sm:p-6 ${map ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8" : "max-w-2xl"}`}
        >
          <div className="flex flex-col gap-4">
            <h2 id="visit-heading" className="sr-only">
              Visit GTS
            </h2>
            <p className="eyebrow">Visit</p>
            {address ? (
              <p className="flex items-start gap-2.5 text-[15px] text-white">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                {address}
              </p>
            ) : (
              <p className="card-text">Ask us for directions when you book.</p>
            )}
            {info?.openingHours && (
              <p className="flex items-start gap-2.5 text-[15px] text-white/85">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                {info.openingHours}
              </p>
            )}
            {directions && (
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-brand-green)] hover:text-[var(--color-green-hover)]"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
              </a>
            )}
          </div>
          {map && (
            <iframe
              src={map}
              className="h-64 w-full rounded-[var(--radius-md)] border border-[var(--color-line)] sm:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={address ? `Map showing ${address}` : "Map showing the GoalThali Sports location"}
            />
          )}
        </section>

        {/* Introduction above, the booking form below at full width: the
            calendar and the day's times sit side by side on desktop and stack
            on phones, with no cramped date row to scroll sideways. */}
        <section id="book-a-visit" aria-labelledby="book-heading" className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Get an appointment</p>
              <h2 id="book-heading" className="display-md">
                Book a visit
              </h2>
              <p className="lead">
                Choose a day and time to visit GTS and talk through your kit in person - designs, sizes, quantities, and
                deadlines.
              </p>
            </div>
            <ol className="grid grid-cols-1 gap-x-6 gap-y-2 text-[15px] leading-snug text-[var(--color-text-gray)] sm:grid-cols-2">
              <li>1. Pick a date on the calendar.</li>
              <li>2. Slide to the time you&apos;d like to come in.</li>
              <li>3. Add your name and contact number.</li>
              <li>4. Book - you get a reference straight away, and the GTS team confirms your visit.</li>
            </ol>
          </div>
          <div className="surface-card p-4 sm:p-6 lg:p-8">
            <BookVisit whatsapp={info?.whatsapp} />
          </div>
        </section>

        <section aria-labelledby="message-heading" className="max-w-2xl">
          <div className="surface-card flex flex-col gap-4 p-5 sm:p-8">
            <h2 id="message-heading" className="text-xl font-bold not-italic text-white">
              Send a message
            </h2>
            <p className="card-text">
              Prefer email? Send your question here and we&apos;ll reply to the address you give.
            </p>
            <ContactForm />
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
