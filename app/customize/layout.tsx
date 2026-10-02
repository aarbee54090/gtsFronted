import { SiteShell } from "@/components/site/SiteShell"

// Every step of the order flow (category -> sport/design -> customizer ->
// quotation -> checkout) shares the site frame: navbar, footer with contact
// details, and the WhatsApp button for questions mid-order.
export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
