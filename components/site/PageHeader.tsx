import type { ReactNode } from "react"
import Link from "next/link"
import type { Crumb } from "@/lib/structured-data"

interface PageHeaderProps {
  title: ReactNode
  eyebrow?: string
  description?: ReactNode
  /** Parent pages, shown as a visible breadcrumb trail (the page itself is the h1). */
  crumbs?: Crumb[]
  children?: ReactNode
}

/** The top of an inner page: breadcrumb trail, eyebrow, h1, intro. */
export function PageHeader({ title, eyebrow, description, crumbs, children }: PageHeaderProps) {
  return (
    <header className="container-site page-top pb-8 sm:pb-10">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[var(--color-text-gray)]">
            {crumbs.map((crumb, i) => (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                <Link href={crumb.path} className="hover:text-white">
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex max-w-3xl flex-col gap-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display-lg">{title}</h1>
        {description && <p className="lead">{description}</p>}
      </div>
      {children}
    </header>
  )
}
