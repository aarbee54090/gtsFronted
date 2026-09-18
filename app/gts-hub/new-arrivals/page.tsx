import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"

export const metadata: Metadata = {
  title: "New Arrivals | GTS Hub",
  description: "The latest jersey and sportswear designs from GTS.",
}

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
