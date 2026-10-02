import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight, CalendarDays, Check, ChevronDown, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductPageCopy } from "@/lib/product-seo"
import { whatsappLink } from "@/lib/site"

export interface OverviewLink {
  href: string
  label: string
}

interface ProductOverviewProps {
  copy: ProductPageCopy
  designCount: number
  /** lowestPrice() of the product's tiers ("From Rs 900 per piece"), or null when it's quoted per order. */
  fromPrice: string | null
  /** priceSummary() of the product's tiers, or null when it's quoted per order. */
  prices: string | null
  /** Our Work projects, new arrivals, and fabrics for this sport. */
  related: OverviewLink[]
  whatsapp?: string | null
}

/**
 * Below the design picker on a product page: what can be customized, what
 * it costs, how ordering works, and related work - so the page answers what
 * someone searching for "<sport> jersey printing" wants to know. Each topic
 * is a collapsed row with a one-line summary (same pattern as the addons),
 * so phones don't get a long scroll; the full text is still in the page for
 * search engines. Everything here mirrors the real order flow
 * (lib/process-steps.ts) and the product's own catalog data.
 */
export function ProductOverview({ copy, designCount, fromPrice, prices, related, whatsapp }: ProductOverviewProps) {
  const customizable = [
    designCount > 0
      ? `One of our ${designCount} ${copy.noun} designs, or your own artwork`
      : "Your own design - upload it above",
    copy.isJersey ? "Your team's colours, logo and sponsor artwork" : "Your logo and artwork",
    copy.isJersey
      ? "Each player's name, number and size - type them in or upload a spreadsheet"
      : "Names and sizes for everyone - type them in or upload a spreadsheet",
    ...(copy.isJersey ? ["Full or half sleeves and collar style", "Matching shorts or tracks"] : []),
  ]

  return (
    <section aria-labelledby="product-overview-heading" className="mt-12 flex flex-col gap-4">
      <h2 id="product-overview-heading" className="display-md">
        {copy.nounPlural.charAt(0).toUpperCase() + copy.nounPlural.slice(1)}, made for your team
      </h2>

      <div className="grid items-start gap-3 md:grid-cols-2">
        <Topic
          title="What you can customize"
          hint={copy.isJersey ? "Design, colours, names and numbers, sleeves, shorts" : "Design, logo, names and sizes"}
        >
          <ul className="flex flex-col gap-2 text-sm leading-snug text-[var(--color-text-gray)]">
            {customizable.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </Topic>

        <Topic title="Price" hint={fromPrice ?? "Quoted per order on WhatsApp"}>
          <p className="text-sm leading-relaxed text-[var(--color-text-gray)]">
            {prices
              ? `${prices} The more you order, the less each piece costs - your exact total shows as you customize.`
              : `Prices for custom ${copy.nounPlural} are quoted per order. Send us your design and quantity on WhatsApp for a quote.`}
          </p>
        </Topic>

        <Topic title="How ordering works" hint="40% advance, then delivery anywhere in Nepal">
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-snug text-[var(--color-text-gray)] marker:font-bold marker:text-[var(--color-brand-green)]">
            <li>
              {designCount > 0 ? "Pick a design above or upload your own" : "Upload your design above"}, then customize it
              {prices ? " - your price updates as you go." : ", then ask us for a quote on WhatsApp."}
            </li>
            <li>Order with a 40% advance - we review every order before production.</li>
            <li>
              We make your order (at least 2 days) and deliver anywhere in Nepal. Track it with your Order ID; the
              remaining 60% is due when it&apos;s ready.
            </li>
          </ol>
          <Link
            href="/process"
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[var(--color-brand-green)] hover:underline"
          >
            All the steps and FAQs <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Topic>

        <Topic title="See our work" hint="Kits we've made, new designs and fabrics">
          <ul className="flex flex-col gap-2 text-sm">
            {[...related, { href: "/gts-hub/portfolio", label: "All kits we've made" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-start gap-1.5 text-white/85 underline-offset-4 hover:text-[var(--color-brand-green)] hover:underline"
                >
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Topic>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg" variant="secondary">
          <a
            href={whatsappLink(whatsapp, `Hi GoalThali Sports, I'd like a quote for custom ${copy.nounPlural}.`)}
            target="_blank"
            rel="noreferrer"
            data-whatsapp-cta
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Ask on WhatsApp
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/gts-hub/contact#book-a-visit">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a visit in Kathmandu
          </Link>
        </Button>
      </div>
    </section>
  )
}

/** A collapsed row with a one-line summary; tapping it shows the details. */
function Topic({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <details className="group glass-2 rounded-[var(--radius-lg)]">
      {/* A grid rather than wrapper elements: <summary> may only hold the
          heading and phrasing content directly. */}
      <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 p-4 [&::-webkit-details-marker]:hidden">
        <h3 className="card-title">{title}</h3>
        <span className="text-xs text-[var(--color-text-gray)]">{hint}</span>
        <ChevronDown
          className="col-start-2 row-span-2 row-start-1 h-5 w-5 text-[var(--color-text-gray)] transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-3 border-t border-[var(--glass-border)] px-4 pb-4 pt-3">{children}</div>
    </details>
  )
}
