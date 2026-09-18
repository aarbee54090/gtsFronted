"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch, ApiError } from "@/lib/api"
import type { Platform } from "@/lib/platform-types"
import { PlatformForm } from "./PlatformForm"

interface PlatformEditPageProps {
  id: string // an actual _id, or the literal string "new"
}

export function PlatformEditPage({ id }: PlatformEditPageProps) {
  const isNew = id === "new"
  const [data, setData] = useState<Platform | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    apiFetch<{ success: boolean; data: Platform }>(`/platforms/admin/${id}`, { requireAdmin: true })
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load."))
      .finally(() => setLoading(false))
  }, [id, isNew])

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/platforms" className="text-xs font-semibold text-[var(--color-text-gray)] hover:text-white">
          ← Platforms
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white">{isNew ? "New Platform" : "Edit Platform"}</h1>

      {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>}
      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}
      {!loading && !error && (isNew || data) && <PlatformForm initialData={data ?? undefined} />}
    </div>
  )
}
