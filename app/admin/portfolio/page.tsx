"use client"

import { ContentListTable } from "@/components/admin/gts-hub/ContentListTable"
import { PORTFOLIO_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminPortfolioPage() {
  return <ContentListTable config={PORTFOLIO_CONFIG} />
}
