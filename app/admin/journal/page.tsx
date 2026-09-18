"use client"

import { ContentListTable } from "@/components/admin/gts-hub/ContentListTable"
import { JOURNAL_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminJournalPage() {
  return <ContentListTable config={JOURNAL_CONFIG} />
}
