import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"

export const metadata: Metadata = {
  title: "Journal | GTS Hub",
  description: "Guides, behind-the-scenes stories, and everything jersey-making from GTS.",
}

export default function JournalListPage() {
  return (
    <HubListPage
      contentType="journal"
      apiBasePath="/journal"
      title="Journal"
      description="Guides, behind-the-scenes, and everything jersey-making."
    />
  )
}
