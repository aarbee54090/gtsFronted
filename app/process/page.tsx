import type { Metadata } from "next"
import Link from "next/link"
import { Process } from "@/components/landing/Process"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { PageHeader } from "@/components/site/PageHeader"
import { SiteShell } from "@/components/site/SiteShell"
import { brandTitle, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

export const metadata: Metadata = pageMetadata({
  title: brandTitle("How Custom Jersey Orders Work: 7 Steps"),
  description:
    "How ordering custom jerseys from GoalThali Sports works: choose a design, see your price, pay a 40% advance, then track production and delivery across Nepal.",
  path: "/process",
})

// Questions customers ask before ordering, answered only with how the site
// and ordering flow actually work - no turnaround promises or policies that
// haven't been confirmed by the business.
const FAQ: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What can I customize?",
    answer: (
      <>
        The design (one of ours or your own artwork), sleeve and collar options, extras such as shorts or tracks, and
        each player&apos;s name, number, and size. Logos and sponsor artwork can be attached as files.
      </>
    ),
  },
  {
    question: "How is the price worked out?",
    answer: (
      <>
        It depends on the product and design, how many pieces you order (each product has quantity price tiers), and the
        options you add. You see the total update as you customize, before you order.
      </>
    ),
  },
  {
    question: "What if my quantity isn't in the price list?",
    answer: (
      <>
        Some quantities fall outside a product&apos;s listed price tiers. When that happens the site tells you, and you
        can{" "}
        <Link href="/gts-hub/contact" className="text-[var(--color-brand-green)] underline underline-offset-4">
          contact us
        </Link>{" "}
        for a custom quote.
      </>
    ),
  },
  {
    question: "How do I pay?",
    answer: (
      <>
        You pay a 40% advance when you place the order, using one of the payment methods shown at checkout, and upload
        your payment receipt. The remaining 60% is due when your order is ready.
      </>
    ),
  },
  {
    question: "Do you deliver outside Kathmandu?",
    answer: (
      <>
        Yes - we deliver anywhere in Nepal. Enter your delivery address at checkout, and follow your order with its
        Order ID until it arrives.
      </>
    ),
  },
  {
    question: "Do I need an account?",
    answer: (
      <>
        Yes - placing an order needs a GTS account with your name, phone number, and address. Tracking an order
        doesn&apos;t: your Order ID is enough.
      </>
    ),
  },
  {
    question: "Can I send my own design or a player list?",
    answer: (
      <>
        Yes. Upload your own design instead of choosing one of ours, and add players one by one or upload a spreadsheet
        (.xlsx or .xls) to fill in names, numbers, and sizes.
      </>
    ),
  },
  {
    question: "Can I see fabrics or talk to someone first?",
    answer: (
      <>
        Our{" "}
        <Link href="/gts-hub/materials" className="text-[var(--color-brand-green)] underline underline-offset-4">
          Materials
        </Link>{" "}
        page describes the fabrics we use, and{" "}
        <Link href="/gts-hub/portfolio" className="text-[var(--color-brand-green)] underline underline-offset-4">
          Our Work
        </Link>{" "}
        shows finished kits. To talk it through,{" "}
        <Link href="/gts-hub/contact#book-a-visit" className="text-[var(--color-brand-green)] underline underline-offset-4">
          book a visit
        </Link>{" "}
        or message us on WhatsApp.
      </>
    ),
  },
]

export default function ProcessPage() {
  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode([{ name: "How it works", path: "/process" }]))} />
      <PageHeader
        eyebrow="How it works"
        title="From idea to jersey, in 7 steps"
        description="Every step of ordering a custom kit from GoalThali Sports - what you choose, how the price works, how you pay, and how you follow your order."
      />
      <div className="container-site flex flex-col gap-20 pb-20">
        <Process />

        <section aria-labelledby="faq-heading" className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-heading" className="display-md">
              Before you order
            </h2>
            <p className="lead">Answers to what teams usually ask first.</p>
          </div>
          <dl className="flex flex-col divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
            {FAQ.map((item) => (
              <div key={item.question} className="flex flex-col gap-2 py-5">
                <dt className="text-base font-bold text-white">{item.question}</dt>
                <dd className="text-[15px] leading-relaxed text-[var(--color-text-gray)]">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <ContextualCTA />
      </div>
    </SiteShell>
  )
}
