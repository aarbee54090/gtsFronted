"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch, ApiError } from "@/lib/api"
import type { Platform } from "@/lib/platform-types"

export function PlatformListTable() {
  const [items, setItems] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<{ success: boolean; data: Platform[] }>("/platforms/admin", { requireAdmin: true })
      .then((res) => setItems(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Platforms</h1>
        <Link
          href="/admin/platforms/new"
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2.5 text-sm font-bold text-[var(--color-bg-dark)]"
        >
          + New Platform
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>}
      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-[var(--color-text-gray)]">No platforms yet - create your first one above.</p>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/admin/platforms/${item._id}`}
              className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--glass-border)] px-4 py-3 transition-colors hover:border-[var(--color-brand-green)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{item.name}</span>
                <span className="text-xs text-[var(--color-text-gray)]">order: {item.order}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    item.status === "published"
                      ? "bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]"
                      : "bg-white/10 text-[var(--color-text-gray)]"
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-xs text-[var(--color-text-gray)]">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
