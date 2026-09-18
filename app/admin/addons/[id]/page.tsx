"use client"

import { useParams } from "next/navigation"
import { AddonEditPage } from "@/components/admin/addons/AddonEditPage"

export default function AdminAddonEditRoute() {
  const params = useParams<{ id: string }>()
  return <AddonEditPage id={params.id} />
}
