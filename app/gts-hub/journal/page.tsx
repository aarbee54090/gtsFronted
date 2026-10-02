import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"
import { brandTitle, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: brandTitle("Journal: Jersey Guides & Behind the Scenes"),
  description: "Guides, behind-the-scenes stories, and everything jersey-making from GoalThali Sports, a custom sportswear maker in Nepal.",
  path: "/gts-hub/journal",
})

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
