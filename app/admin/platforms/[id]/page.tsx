"use client"

import { useParams } from "next/navigation"
import { PlatformEditPage } from "@/components/admin/platforms/PlatformEditPage"

export default function AdminPlatformEditRoute() {
  const params = useParams<{ id: string }>()
  return <PlatformEditPage id={params.id} />
}
