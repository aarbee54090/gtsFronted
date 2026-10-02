import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { brandTitle, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: brandTitle("Track Your Order"),
  description: "Enter your GoalThali Sports order ID (GTS-XXXXXXXX) to check the status of your custom sportswear order.",
  path: "/track",
});

// The page itself is a client component, so the shared site frame (navbar,
// footer, WhatsApp button) comes from this server layout.
export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
