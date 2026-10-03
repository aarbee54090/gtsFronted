import type { Metadata } from "next"
import { Hero } from "@/components/landing/Hero"
import { ProductRange } from "@/components/home/ProductRange"
import { HubSection } from "@/components/home/HubSection"
import { VisitCta } from "@/components/home/VisitCta"
import { SiteShell } from "@/components/site/SiteShell"
import { JsonLd } from "@/components/seo/JsonLd"
import {
  fetchActiveProducts,
  fetchCategories,
  fetchMainProducts,
  getContactInfo,
  getHubSectionImages,
  getPublishedPlatforms,
} from "@/lib/api"
import { resolveMainProductCards } from "@/lib/catalog"
import { HOME_TITLE, SITE_DESCRIPTION, pageMetadata } from "@/lib/seo"
import { jsonLd, organizationNode, webSiteNode } from "@/lib/structured-data"

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
})

export default async function Home() {
  // A section whose content fails to load is simply left out - the page
  // itself never fails because one backend call did.
  const [contact, platforms, sectionImages, mainProducts, categories, products] = await Promise.all([
    getContactInfo().catch(() => null),
    getPublishedPlatforms().catch(() => []),
    getHubSectionImages().catch(() => []),
    fetchMainProducts(),
    fetchCategories(),
    fetchActiveProducts(),
  ])

  // The admin-managed "Our Platforms" links are the brand's real profiles -
  // they become the Organization's sameAs.
  const profileUrls = platforms.map((platform) => platform.url).filter((url) => /^https?:\/\//i.test(url))

  return (
    <SiteShell contact={contact}>
      <JsonLd data={jsonLd(organizationNode(profileUrls, contact), webSiteNode())} />
      <Hero whatsapp={contact?.whatsapp} />
      <ProductRange cards={resolveMainProductCards(mainProducts, categories)} products={products} />
      <HubSection sectionImages={sectionImages} platforms={platforms} />
      <VisitCta contact={contact} />
    </SiteShell>
  )
}
