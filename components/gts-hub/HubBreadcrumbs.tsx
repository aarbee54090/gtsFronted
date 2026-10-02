import Link from "next/link"
import type { Crumb } from "@/lib/structured-data"

// Visible "GTS Hub / Journal" trail above a hub item's title - the page's
// own name is the h1 right below, so only its parents are listed. The
// matching BreadcrumbList JSON-LD is emitted by the page itself.
export function HubBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
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
  )
}
