import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawl guidance only, not access control - every route behind /admin and
// /account is gated server-side (requireAdmin / requireCustomer) and
// noindex'd (app/admin/layout.tsx, app/account/layout.tsx).
//
// /account is deliberately not disallowed: the navbar links to
// /account/register from every page, and a crawler blocked from a URL never
// sees its noindex, so search engines can still list the bare URL. Letting
// them crawl it is what makes the noindex stick. /admin isn't linked from
// any public page, so it stays disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
