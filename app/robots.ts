import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawl guidance only, not access control - /admin and /account are also
// noindex'd (app/admin/layout.tsx, app/account/layout.tsx) and every
// route behind them is gated server-side (requireAdmin / requireCustomer).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/account", "/account/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
