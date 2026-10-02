import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContextualCTAProps {
  title?: string
  description?: string
  /** The main action - defaults to starting an order. */
  action?: { href: string; label: string }
}

/** "Ready to make your own?" panel at the end of GTS Hub pages. */
export function ContextualCTA({
  title = "Ready to create your own?",
  description = "Design custom jerseys, T-shirts, hoodies, and tracksuits for your team - and see your price as you go.",
  action = { href: "/products", label: "Start Customizing" },
}: ContextualCTAProps) {
  return (
    <div className="surface-card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="card-title text-xl">{title}</h2>
        <p className="card-text">{description}</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild>
          <Link href={action.href}>
            {action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/gts-hub/contact#book-a-visit">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Book a Visit
          </Link>
        </Button>
      </div>
    </div>
  )
}
