"use client"

import { useParams } from "next/navigation"
import { ContentEditPage } from "@/components/admin/gts-hub/ContentEditPage"
import { PORTFOLIO_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminPortfolioEditPage() {
  const params = useParams<{ id: string }>()
  return <ContentEditPage config={PORTFOLIO_CONFIG} id={params.id} />
}
