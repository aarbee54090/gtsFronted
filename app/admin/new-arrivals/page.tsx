"use client"

import { ContentListTable } from "@/components/admin/gts-hub/ContentListTable"
import { NEW_ARRIVAL_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminNewArrivalsPage() {
  return <ContentListTable config={NEW_ARRIVAL_CONFIG} />
}
