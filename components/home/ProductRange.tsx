import Link from "next/link"
import { ProductTile, productGridClass } from "@/components/products/ProductTile"
import { SectionHeader } from "@/components/site/SectionHeader"
import type { BackendProductSummary } from "@/lib/api"
import type { ProductCard } from "@/lib/catalog"
import { customizePath } from "@/lib/seo"
import { sportLabel } from "@/lib/sports"

/**
 * Sports with their own jersey design gallery, straight from the live
 * catalog: the active products in the jerseys line. (Other lines use the
 * product's "sport" field for a style name - "Hoodie", "t-shirt" - so they
 * aren't listed as sports.)
 */
export function jerseySports(products: BackendProductSummary[]): { label: string; href: string }[] {
  const seen = new Set<string>()
  return products
    .filter((p) => /jersey/i.test(p.category))
    .flatMap((p) => {
      const key = p.sport.trim().toLowerCase()
      if (!key || seen.has(key)) return []
      seen.add(key)
      return [{ label: `${sportLabel(p.sport)} jerseys`, href: customizePath(p.category, p.sport) }]
    })
}

export function ProductRange({ cards, products }: { cards: ProductCard[]; products: BackendProductSummary[] }) {
  const sports = jerseySports(products)
  if (cards.length === 0 && sports.length === 0) return null

  return (
    <section aria-labelledby="products-heading" className="section">
      <div className="container-site">
        <SectionHeader
          id="products-heading"
          eyebrow="What we make"
          title="Choose what to customize"
          description="Every piece is made to order. Pick a product, choose a design for your sport, and make it yours."
          action={{ href: "/products", label: "All products" }}
        />

        {cards.length > 0 && (
          <div className={productGridClass(cards.length)}>
            {cards.map((item) => (
              <ProductTile key={item._id} item={item} titleAs="h3" />
            ))}
          </div>
        )}

        {sports.length > 0 && (
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="shrink-0 text-sm font-semibold text-white">Custom jerseys by sport:</p>
            <ul className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <li key={sport.href}>
                  <Link href={sport.href} className="chip">
                    {sport.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
