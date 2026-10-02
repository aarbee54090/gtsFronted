import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, MessageCircle } from "lucide-react"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { Button } from "@/components/ui/button"
import { getAppointmentStatus, getContactInfo } from "@/lib/api"
import { STATUS_EXPLANATION, STATUS_LABEL, formatLongDate, formatTime } from "@/lib/appointments"
import { decodeRouteParam } from "@/lib/route-params"
import { pageMetadata, brandTitle } from "@/lib/seo"
import { whatsappLink } from "@/lib/site"

interface PageProps {
  params: Promise<{ reference: string }>
}

// A customer's own booking - never indexed, never cached.
export const metadata: Metadata = pageMetadata({
  title: brandTitle("Your Visit Request"),
  noindex: true,
})
export const dynamic = "force-dynamic"

const REFERENCE_PATTERN = /^APT-[A-HJ-NP-Z2-9]{8}$/

/**
 * Status of a visit request, looked up by its booking reference. Shows only
 * what the public endpoint returns - status and time - never the name or
 * number it was booked under.
 */
export default async function AppointmentStatusPage({ params }: PageProps) {
  const { reference: raw } = await params
  const reference = (decodeRouteParam(raw) ?? "").trim().toUpperCase()
  if (!REFERENCE_PATTERN.test(reference)) notFound()

  const [booking, contact] = await Promise.all([
    getAppointmentStatus(reference).catch(() => undefined),
    getContactInfo().catch(() => null),
  ])
  if (booking === null) notFound()

  return (
    <SiteShell contact={contact}>
      <PageHeader eyebrow="Your visit" title={`Booking ${reference}`} />
      <div className="container-site pb-20">
        {booking === undefined ? (
          <p className="notice notice-warning max-w-2xl">
            We couldn&apos;t load this booking right now. Please try again in a moment, or message us with your
            reference.
          </p>
        ) : (
          <div className="surface-card flex max-w-2xl flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <CalendarDays className="h-5 w-5 text-[var(--color-brand-green)]" aria-hidden="true" />
                {formatLongDate(booking.startsAt)}, {formatTime(booking.startsAt)}
              </p>
              <span className={`badge badge-${booking.status}`}>{STATUS_LABEL[booking.status]}</span>
            </div>
            <p className="text-sm text-[var(--color-text-gray)]">Times are Nepal time (Asia/Kathmandu).</p>
            <p className="text-[15px] leading-relaxed text-white/85">{STATUS_EXPLANATION[booking.status]}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <a
                  href={whatsappLink(contact?.whatsapp, `Hi GoalThali Sports, about my visit request ${reference}.`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Message us about this visit
                </a>
              </Button>
              {booking.status === "cancelled" && (
                <Button asChild>
                  <Link href="/gts-hub/contact#book-a-visit">Book another time</Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-gray)]">
              Need to change or cancel? Message or call us with your booking reference.
            </p>
          </div>
        )}
      </div>
    </SiteShell>
  )
}
