import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"

export const metadata: Metadata = {
  title: "Portfolio | GTS Hub",
  description: "Real GTS work - completed jersey and sportswear projects for teams, colleges, and clubs.",
}

export default function PortfolioListPage() {
  return (
    <HubListPage
      contentType="portfolio"
      apiBasePath="/portfolio"
      title="Portfolio"
      description="Real GTS work - completed projects for teams, colleges, and clubs."
    />
  )
}
