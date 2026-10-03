import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"
import { brandTitle, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: brandTitle("Jersey Fabrics & Materials"),
  description: "The fabrics behind every GoalThali Sports jersey - fabric weight (GSM), features, and which sports each one suits best.",
  path: "/gts-hub/materials",
})

export default function MaterialsListPage() {
  return (
    <HubListPage
      contentType="material"
      apiBasePath="/materials"
      title="Materials"
      description="The fabrics and materials behind every GTS product."
    />
  )
}
