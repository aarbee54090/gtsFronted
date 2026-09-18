"use client"

import { useParams } from "next/navigation"
import { ContentEditPage } from "@/components/admin/gts-hub/ContentEditPage"
import { JOURNAL_CONFIG } from "@/lib/gts-hub-field-configs"

export default function AdminJournalEditPage() {
  const params = useParams<{ id: string }>()
  return <ContentEditPage config={JOURNAL_CONFIG} id={params.id} />
}
