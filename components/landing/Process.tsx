import { Calculator, Hammer, PackageCheck, Search, Shirt, Sliders, Wallet, type LucideIcon } from "lucide-react"
import { PROCESS_STEPS } from "@/lib/process-steps"

const ICONS: Record<string, LucideIcon> = {
  design: Shirt,
  customize: Sliders,
  price: Calculator,
  advance: Wallet,
  review: Hammer,
  track: Search,
  receive: PackageCheck,
}

/**
 * The full ordering process, every step's detail visible in the page (it
 * used to sit behind tap-to-open accordions, which kept the payment terms
 * out of the HTML search engines read). Server-rendered, no JavaScript.
 */
export function Process() {
  return (
    <ol className="relative grid list-none gap-4 p-0 md:grid-cols-2">
      {PROCESS_STEPS.map((step, i) => {
        const Icon = ICONS[step.key] ?? Shirt
        return (
          <li key={step.key} className="surface-card flex gap-4 p-5 sm:p-6">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text-gray)]">Step {i + 1}</p>
              <h3 className="card-title">{step.title}</h3>
              <p className="card-text">{step.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
