"use client"

import { ContentListTable } from "@/components/admin/gts-hub/ContentListTable"
import { MATERIAL_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminMaterialsPage() {
  return <ContentListTable config={MATERIAL_CONFIG} />
}
