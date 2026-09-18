"use client"

import { useParams } from "next/navigation"
import { ContentEditPage } from "@/components/admin/gts-hub/ContentEditPage"
import { NEW_ARRIVAL_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminNewArrivalEditPage() {
  const params = useParams<{ id: string }>()
  return <ContentEditPage config={NEW_ARRIVAL_CONFIG} id={params.id} />
}
