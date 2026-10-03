// Single source of truth for the production origin, used by metadataBase,
// robots.ts, sitemap.ts, canonical URLs, and JSON-LD. Override via
// NEXT_PUBLIC_SITE_URL in Vercel if the domain ever changes. Any trailing
// slash is dropped so `${SITE_URL}/path` never produces a double slash.
//
// The default is the www host because that's the one the site is served
// from: https://goalthalisports.com permanently redirects to it, and a
// canonical or sitemap URL must not point at a redirect.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.goalthalisports.com").replace(/\/+$/, "");

// Brand names used in titles, social tags, and structured data.
export const SITE_NAME = "GoalThali Sports";
export const SITE_SHORT_NAME = "GTS";

// Fallback contact details, used only when the admin-managed Contact Us
// record (GET /api/contact) can't be loaded. Same values as that record.
export const FALLBACK_WHATSAPP = "9779705743117";

/** Digits only - the form wa.me links require (no +, spaces, or dashes). */
export function whatsappDigits(value: string | undefined | null): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits || FALLBACK_WHATSAPP;
}

/** wa.me link, optionally with a pre-filled message. */
export function whatsappLink(number?: string | null, message?: string): string {
  const base = `https://wa.me/${whatsappDigits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * A phone number in international form ("+9779705743117"): a bare 10-digit
 * Nepali mobile gets +977, anything already international is kept.
 */
export function internationalPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (/^9779[678]\d{8}$/.test(digits)) return `+${digits}`;
  return /^9[678]\d{8}$/.test(digits) ? `+977${digits}` : digits;
}

/** tel: link in international form, so it dials correctly from abroad too. */
export function telLink(phone: string): string {
  return `tel:${internationalPhone(phone)}`;
}
