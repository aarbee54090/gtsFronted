import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CardPhoto } from "@/components/shared/CardPhoto"
import type { ProductCard } from "@/lib/catalog"

const PHOTO_CLASS = "object-cover transition-transform duration-500 group-hover:scale-[1.03]"

/**
 * Grid columns for a set of product tiles - every column filled where
 * possible, so three product lines don't leave an empty fourth column.
 */
export function productGridClass(count: number): string {
  const columns =
    count <= 1
      ? ""
      : count === 2
        ? "sm:grid-cols-2"
        : count === 3
          ? "sm:grid-cols-3"
          : count === 4
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  return `grid grid-cols-1 gap-4 sm:gap-5 ${columns}`
}

/**
 * "Hoodie Custom Designed" -> { name: "Hoodie", label: "Custom Designed" }.
 * Admins name every product line "<product> Custom Designed"; leading with
 * the product makes the cards scannable. Other names are left whole.
 */
export function splitProductName(name: string): { name: string; label?: string } {
  const match = /^(.*\S)\s+(custom\s+designs?(?:ed)?)$/i.exec(name.trim())
  return match ? { name: match[1], label: match[2] } : { name: name.trim() }
}

// Admin descriptions shorter than this ("hoodie") read as a placeholder,
// so the card uses a generic line instead.
const MIN_DESCRIPTION_LENGTH = 20

/**
 * One product line (Jerseys, T-shirts, Hoodies, ...) linking into its
 * customizer. Phones get a compact card with a wide banner - the admin's
 * landscape mobile crop - and the name beside a large tap target; from
 * `sm` up it's a square photo card using the portrait desktop crop.
 */
export function ProductTile({ item, titleAs: Title = "h2" }: { item: ProductCard; titleAs?: "h2" | "h3" }) {
  const { name, label } = splitProductName(item.name)
  const own = item.description?.trim()
  const description = own && own.length >= MIN_DESCRIPTION_LENGTH ? own : "Made to order with your team's design."

  return (
    <Link
      href={item.href}
      className="group surface-card surface-card-interactive relative flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-black/40 sm:aspect-square">
        <CardPhoto
          src={item.thumbnailImageUrl}
          mobileSrc={item.thumbnailImageUrlMobile}
          alt={item.name}
          sizes="(max-width: 1024px) 34vw, 380px"
          mobileSizes="100vw"
          className={PHOTO_CLASS}
        />
      </div>

      {/* Label -> name -> description -> action, with the same rhythm on every
          card; the action sits at the bottom so a row of cards lines up. */}
      <div className="flex flex-1 items-center gap-4 p-4 sm:flex-col sm:items-stretch sm:gap-5 sm:p-6">
        <div className="flex min-w-0 flex-1 flex-col">
          {label && (
            <span aria-hidden="true" className="eyebrow">
              {label}
            </span>
          )}
          <Title className="card-title card-title-lg mt-1.5">
            {name}
            {/* The space sits outside the hidden span so the heading's
                accessible name is "Hoodie Custom Designed", not "HoodieCustom". */}
            {label && (
              <>
                {" "}
                <span className="sr-only">{label}</span>
              </>
            )}
          </Title>
          <p className="card-text mt-2 line-clamp-2">{description}</p>
        </div>
        {/* Phones: a large round arrow as the tap affordance; desktop: a labelled call to action. */}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-[var(--color-bg-dark)] transition-transform group-hover:translate-x-0.5 sm:hidden"
        >
          <ArrowRight className="h-5 w-5" />
        </span>
        <span className="hidden min-h-11 items-center justify-between rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 text-sm font-semibold text-white transition-colors group-hover:border-[var(--color-brand-green)] group-hover:bg-[var(--color-brand-green)] group-hover:text-[var(--color-bg-dark)] sm:flex">
          Start customizing
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
