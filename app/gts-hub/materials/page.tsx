import type { Metadata } from "next"
import { HubListPage } from "@/components/gts-hub/HubListPage"

export const metadata: Metadata = {
  title: "Materials | GTS Hub",
  description: "The fabrics and materials behind every GTS product.",
}

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
