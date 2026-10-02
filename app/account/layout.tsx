import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";

// Account pages (login, orders, saved designs, settings, ...) are
// per-customer and gated server-side by requireCustomer on every backend
// route they call. noindex just keeps them out of search results - it is
// not the access control.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// Most account pages are client components, so the shared site frame
// (navbar, footer, WhatsApp button) comes from this server layout.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
