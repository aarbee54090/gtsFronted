// schema.org JSON-LD builders. Rendered with <JsonLd> (components/seo).
// Only describes what the site actually shows - no ratings, prices, or
// contact details that aren't real and visible.

import type { ContactInfo } from "./contact-types"
import { directionsUrl } from "./contact"
import { internationalPhone, SITE_NAME, SITE_SHORT_NAME, SITE_URL } from "./site"
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_DESCRIPTION } from "./seo"

export type JsonLdNode = Record<string, unknown>

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`

// Square version of the GTS mark (public/images/gts-logo-square.png) - the
// transparent gts-logo.png is near-white and disappears on the white
// backgrounds search results use for logos.
const LOGO = { path: "/images/gts-logo-square.png", width: 512, height: 512 }

// Spellings the brand actually appears under on the site and in its content.
const ALTERNATE_NAMES = [SITE_SHORT_NAME, "Goal Thali Sports"]

// "GoalThali Sports", "Goal Thali Sports Team", "GTS", ... -> the brand itself.
function isBrandName(name: string): boolean {
  const key = name.toLowerCase().replace(/[^a-z]/g, "")
  return key.startsWith("goalthali") || key === SITE_SHORT_NAME.toLowerCase()
}

export function jsonLd(...nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes }
}

function logoNode(): JsonLdNode {
  return { "@type": "ImageObject", url: absoluteUrl(LOGO.path), width: LOGO.width, height: LOGO.height }
}

/**
 * The business's postal address, only from the admin's structured address
 * fields - a locality is the minimum. Without one there is no address beyond
 * the country, rather than a guess parsed out of free text.
 */
function postalAddress(contact: ContactInfo | null | undefined): JsonLdNode | null {
  const locality = contact?.addressLocality?.trim()
  if (!locality) return null
  return {
    "@type": "PostalAddress",
    ...(contact?.streetAddress?.trim() ? { streetAddress: contact.streetAddress.trim() } : {}),
    addressLocality: locality,
    ...(contact?.addressRegion?.trim() ? { addressRegion: contact.addressRegion.trim() } : {}),
    ...(contact?.postalCode?.trim() ? { postalCode: contact.postalCode.trim() } : {}),
    addressCountry: "NP",
  }
}

// The owner confirmed orders are delivered anywhere in Nepal.
const AREA_SERVED = { "@type": "Country", name: "Nepal" }

/** Phone and email exactly as published on the Contact Us page. */
function contactFields(contact: ContactInfo | null | undefined): JsonLdNode {
  return {
    ...(contact?.phone?.trim() ? { telephone: internationalPhone(contact.phone) } : {}),
    ...(contact?.email?.trim() ? { email: contact.email.trim() } : {}),
  }
}

/**
 * @param sameAs official profile URLs (from the admin-managed Platforms list)
 * @param contact the admin-managed Contact Us record, when available
 */
export function organizationNode(sameAs: string[] = [], contact?: ContactInfo | null): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: ALTERNATE_NAMES,
    url: absoluteUrl("/"),
    logo: logoNode(),
    description: SITE_DESCRIPTION,
    ...contactFields(contact),
    address: postalAddress(contact) ?? { "@type": "PostalAddress", addressCountry: "NP" },
    areaServed: AREA_SERVED,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

/**
 * The physical place customers can visit (Contact Us page). Returned only
 * when the admin has entered at least the locality of the structured
 * address - Google's local business data needs a real address, and no
 * ratings, reviews, or opening hours are ever made up here.
 */
export function localBusinessNode(contact: ContactInfo | null | undefined): JsonLdNode | null {
  const address = postalAddress(contact)
  if (!address) return null
  const map = directionsUrl(contact)
  return {
    "@type": "LocalBusiness",
    "@id": LOCAL_BUSINESS_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    logo: logoNode(),
    description: SITE_DESCRIPTION,
    address,
    ...contactFields(contact),
    areaServed: AREA_SERVED,
    ...(map ? { hasMap: map } : {}),
    parentOrganization: { "@id": ORGANIZATION_ID },
  }
}

export function webSiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: ALTERNATE_NAMES,
    url: absoluteUrl("/"),
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  }
}

export interface Crumb {
  name: string
  path: string
}

/** Home is prepended automatically. */
export function breadcrumbNode(crumbs: Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

export function blogPostingNode(post: {
  path: string
  headline: string
  description?: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
  section?: string
  keywords?: string[]
}): JsonLdNode {
  const publisher = { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: absoluteUrl("/"), logo: logoNode() }
  // The byline is free text - a post credited to the brand itself is the
  // Organization, anything else is treated as a person's name.
  const author =
    !post.author?.trim() || isBrandName(post.author) ? publisher : { "@type": "Person", name: post.author.trim() }

  return {
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(post.path)}#article`,
    mainEntityOfPage: absoluteUrl(post.path),
    // Google truncates headlines past 110 characters.
    headline: post.headline.length > 110 ? `${post.headline.slice(0, 109)}…` : post.headline,
    ...(post.description ? { description: post.description } : {}),
    ...(post.image ? { image: [post.image] } : {}),
    ...(post.datePublished ? { datePublished: post.datePublished } : {}),
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
    author,
    publisher,
    ...(post.section ? { articleSection: post.section } : {}),
    ...(post.keywords && post.keywords.length > 0 ? { keywords: post.keywords.join(", ") } : {}),
    inLanguage: "en",
  }
}
