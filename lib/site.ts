// Single source of truth for the production origin, used by metadataBase,
// robots.ts, and sitemap.ts. Override via NEXT_PUBLIC_SITE_URL in Vercel if
// the domain ever changes.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goalthalisports.com";
