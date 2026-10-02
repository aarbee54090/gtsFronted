import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"
import { brandTitle, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: brandTitle("New Arrivals: Latest Jersey Designs"),
  description: "The latest custom jersey and sportswear designs and collections from GoalThali Sports, ready to customize for your team.",
  path: "/gts-hub/new-arrivals",
})

export default function NewArrivalsListPage() {
  return (
    <HubListPage
      contentType="new-arrival"
      apiBasePath="/new-arrivals"
      title="New Arrivals"
      description="Our latest designs and collections."
    />
  )
}
