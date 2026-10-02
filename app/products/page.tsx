import type { Metadata } from "next"
import { ProductCategories } from "@/components/landing/ProductCategories"
import { ContextualCTA } from "@/components/gts-hub/ContextualCTA"
import { SiteShell } from "@/components/site/SiteShell"
import { fetchCategories, fetchMainProducts } from "@/lib/api"
import { resolveMainProductCards } from "@/lib/catalog"
import { brandTitle, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbNode, jsonLd } from "@/lib/structured-data"

export const metadata: Metadata = pageMetadata({
  title: brandTitle("Custom Sportswear & Team Uniforms in Nepal"),
  description:
    "Custom team jerseys, T-shirts and hoodies printed in Kathmandu and delivered across Nepal. Pick a product, choose a design and see your price instantly.",
  path: "/products",
})

// Each card opens the product category it matches; main products with no
// category that has active products aren't shown (see lib/catalog.ts).
async function loadProductCards() {
  const [mainProducts, categories] = await Promise.all([fetchMainProducts(), fetchCategories()])
  return resolveMainProductCards(mainProducts, categories)
}

export default function ProductsPage() {
  // Deliberately not awaited - the page and its heading render right away
  // and the product cards stream in (see ProductCategories).
  const productCards = loadProductCards()

  return (
    <SiteShell>
      <JsonLd data={jsonLd(breadcrumbNode([{ name: "Products", path: "/products" }]))} />
      <ProductCategories productCards={productCards} />
      <div className="container-site pb-20">
        <ContextualCTA
          title="Not sure where to start?"
          description="See kits we've made for other teams, or talk it through with us in person."
          action={{ href: "/gts-hub/portfolio", label: "See Our Work" }}
        />
      </div>
    </SiteShell>
  )
}
