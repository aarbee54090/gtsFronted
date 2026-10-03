import type { ContactInfo } from "./contact-types"
import { tidyWords } from "./text"

/**
 * The address to show: the structured fields when the admin has filled them
 * in, otherwise the free-text address field.
 */
export function formatAddress(contact: ContactInfo | null | undefined): string | null {
  if (!contact) return null
  const structured = [contact.streetAddress, contact.addressLocality, contact.addressRegion, contact.postalCode]
    .map((part) => part?.trim())
    .filter(Boolean)
  if (structured.length > 0) return `${structured.join(", ")}, Nepal`
  return contact.address?.trim() ? tidyWords(contact.address) : null
}

/**
 * The Google Maps embed URL to put in the contact page's iframe, or null.
 * The admin field sometimes holds a whole pasted <iframe> tag, or the src
 * followed by its attributes; only the URL itself is kept, and only Google
 * Maps embeds are allowed into an iframe at all.
 */
export function mapEmbedSrc(value: string | undefined): string | null {
  if (!value?.trim()) return null
  let url = value.trim()
  const src = /src\s*=\s*["']([^"']+)["']/i.exec(url)
  if (src) url = src[1]
  url = url.split(/["'\s<>]/)[0]
  try {
    const parsed = new URL(url)
    const isGoogle = /(^|\.)google\.[a-z.]+$/i.test(parsed.hostname)
    return parsed.protocol === "https:" && isGoogle && parsed.pathname.startsWith("/maps/embed") ? parsed.toString() : null
  } catch {
    return null
  }
}

/** The admin's Google Maps place link, if it's a usable https URL. */
export function directionsUrl(contact: ContactInfo | null | undefined): string | null {
  const value = contact?.mapsUrl?.trim()
  if (!value) return null
  try {
    return new URL(value).protocol === "https:" ? value : null
  } catch {
    return null
  }
}
