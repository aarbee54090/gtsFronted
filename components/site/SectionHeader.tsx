import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  /** Optional "see all" style link, shown at the end of the row on wide screens. */
  action?: { href: string; label: string }
  id?: string
  /** h2 for page sections (default); h1 only when this is the page's own heading. */
  as?: "h1" | "h2"
  align?: "left" | "center"
}

/** The heading block that opens a page section - eyebrow, title, intro, and an optional link. */
export function SectionHeader({ eyebrow, title, description, action, id, as: Heading = "h2", align = "left" }: SectionHeaderProps) {
  const centered = align === "center"
  return (
    <div
      className={`mb-8 flex flex-col gap-5 sm:mb-10 ${
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={`flex max-w-2xl flex-col gap-3 ${centered ? "items-center" : ""}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading id={id} className={Heading === "h1" ? "display-lg" : "display-md"}>
          {title}
        </Heading>
        {description && <p className="lead">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-green)] hover:text-[var(--color-green-hover)]"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
