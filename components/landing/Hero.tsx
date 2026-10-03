import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { whatsappLink } from "@/lib/site"

// Facts about how ordering works on this site (see lib/process-steps.ts) -
// not marketing claims.
const FACTS = [
  "Pick one of our designs or upload your own",
  "See your price as you customize",
  "Order with a 40% advance",
  "Track your order online",
]

/**
 * Homepage hero: what GTS makes and where, a line-up of GTS jersey designs,
 * then the ordering actions.
 *
 * The source order is headline -> description -> jerseys -> actions, which
 * is exactly how phones and tablets show it (the image sits between the
 * description and "Start Customizing"). From `lg` up a two-column grid puts
 * the image beside the text, spanning both text rows. Server-rendered with
 * a CSS-only entrance, no animation library.
 */
export function Hero({ whatsapp }: { whatsapp?: string | null }) {
  return (
    <section className="page-top relative">
      {/* From xl the text column is just wide enough for the two-line
          statement (33rem at its full 68px size) and the image takes the
          rest, so the jerseys get as much width as the headline allows. */}
      <div className="container-site grid gap-x-10 pb-12 pt-4 sm:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_1fr] lg:pb-20 xl:grid-cols-[minmax(0,33rem)_minmax(0,1fr)]">
        <div className="rise-in flex max-w-xl flex-col lg:col-start-1 lg:row-start-1 lg:self-end">
          {/* The eyebrow line is part of the h1 so the page's main heading
              says what GTS makes and where, not just the tagline. */}
          <h1 className="display-xl">
            <span className="eyebrow mb-5 block">Custom Jersey Printing in Kathmandu, Nepal</span>
            Create your team.
            <br />
            Wear your <span className="text-[var(--color-brand-green)]">identity.</span>
          </h1>

          <p className="lead mt-5 sm:mt-6">
            Football, cricket, basketball, volleyball and esports jerseys, plus{" "}
            <span className="whitespace-nowrap">T-shirts</span>, hoodies and tracksuits, for teams, schools, clubs and
            companies - designed with you, made by GoalThali Sports and delivered across Nepal.
          </p>
        </div>

        {/* The negative right margin runs the image out to the navbar pill's
            right edge, which sits 16px past the content on smaller laptops
            and a full 32px gutter past it from xl. */}
        <figure className="rise-in relative mx-auto mt-7 w-full max-w-[560px] [animation-delay:100ms] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mr-4 lg:ml-0 lg:mt-0 lg:w-auto lg:max-w-none lg:self-center xl:-mr-8">
          <div
            aria-hidden="true"
            className="absolute inset-[10%] -z-10 rounded-full bg-[var(--color-brand-green)]/15 blur-[60px]"
          />
          {/* The image is a 3:2 line-up of four jerseys, so the frame keeps
              that shape at every size - any crop would cut off a sport. */}
          <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-line-strong)] bg-black shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <Image
              src="/images/hero-case.webp"
              alt="GTS concept jerseys for football, basketball, volleyball and cricket on display under the GoalThali Sports logo"
              fill
              // The page's LCP image: fetched first, at high priority (what
              // Next 16 recommends over `preload` for a single hero image).
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, (min-width: 640px) 560px, 92vw"
              className="object-cover"
            />
          </div>
          {/* Below the image, not over it: an overlay would cover the
              jerseys' sport labels along the bottom edge. */}
          <figcaption className="mt-2.5 px-1 text-xs text-[var(--color-text-gray)]">
            <span className="font-bold text-white">GTS concept designs</span> - Your team&apos;s logo, colours, names, and
            numbers go on the kit.
          </figcaption>
        </figure>

        <div className="rise-in mt-8 flex max-w-xl flex-col [animation-delay:150ms] lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link href="/products">
                Start Customizing <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={whatsappLink(whatsapp, "Hi GoalThali Sports, I'd like a quote for custom jerseys.")} target="_blank" rel="noreferrer" data-whatsapp-cta>
                <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" /> Chat on WhatsApp
              </a>
            </Button>
          </div>

          <Link
            href="/gts-hub/contact#book-a-visit"
            className="mt-3 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-[var(--color-text-gray)] hover:text-white"
          >
            <CalendarDays className="h-4 w-4 text-[var(--color-brand-green)]" aria-hidden="true" />
            Prefer to talk in person? Book a visit
          </Link>

          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-[var(--color-line)] pt-6 sm:grid-cols-2">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-start gap-2.5 text-[15px] leading-snug text-white/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-green)]" aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
