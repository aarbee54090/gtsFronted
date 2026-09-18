"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import type { Platform } from "@/lib/platform-types"
import type { MediaItem } from "@/lib/gts-hub-types"
import { SingleMediaEditor } from "@/components/admin/gts-hub/MediaListEditor"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type FormData = {
  name: string
  slug: string
  url: string
  description: string
  logo?: MediaItem
  order: number
  status: "draft" | "published"
}

interface PlatformFormProps {
  initialData?: Platform
}

export function PlatformForm({ initialData }: PlatformFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?._id)
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    url: initialData?.url ?? "",
    description: initialData?.description ?? "",
    logo: initialData?.logo,
    order: initialData?.order ?? 0,
    status: initialData?.status ?? "draft",
  })
  const [slugTouched, setSlugTouched] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setName(value: string) {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEditing) {
        await apiFetch(`/platforms/${initialData!._id}`, {
          method: "PUT",
          requireAdmin: true,
          body: formData,
        })
      } else {
        await apiFetch(`/platforms`, {
          method: "POST",
          requireAdmin: true,
          body: formData,
        })
      }
      router.push("/admin/platforms")
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialData?._id) return
    if (!window.confirm("Delete this platform? This can't be undone.")) return
    setDeleting(true)
    try {
      await apiFetch(`/platforms/${initialData._id}`, { method: "DELETE", requireAdmin: true })
      router.push("/admin/platforms")
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete.")
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">
          Name <span className="ml-1 text-[var(--color-error-red)]">*</span>
        </label>
        <input
          value={formData.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Instagram"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">Slug</label>
        <input
          value={formData.slug}
          onChange={(e) => {
            setSlugTouched(true)
            setFormData((prev) => ({ ...prev, slug: e.target.value }))
          }}
          placeholder="auto-generated-from-name"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">
          Profile URL <span className="ml-1 text-[var(--color-error-red)]">*</span>
        </label>
        <input
          value={formData.url}
          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="https://instagram.com/goalthalisports"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="One line shown on the card, e.g. Follow our latest designs & drops"
          rows={2}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <SingleMediaEditor label="Logo" value={formData.logo} onChange={(v) => setFormData((prev) => ({ ...prev, logo: v }))} />

      <div className="flex items-center gap-6 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Order</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))}
            className={`${inputClasses} max-w-[120px]`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}
            className={inputClasses}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
        >
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Platform"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-[var(--radius-pill)] border border-[var(--color-error-red)] px-6 py-3 text-sm font-bold text-[var(--color-error-red)] disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  )
}
