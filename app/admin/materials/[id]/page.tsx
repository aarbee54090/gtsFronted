"use client"

import { useParams } from "next/navigation"
import { ContentEditPage } from "@/components/admin/gts-hub/ContentEditPage"
import { MATERIAL_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminMaterialEditPage() {
  const params = useParams<{ id: string }>()
  return <ContentEditPage config={MATERIAL_CONFIG} id={params.id} />
}
