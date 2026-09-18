"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import type { AdminAddon, AdminAddonStyle } from "@/lib/addon-types"
import { AddonStyleListEditor } from "./AddonStyleListEditor"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

type FormData = {
  name: string
  styles: AdminAddonStyle[]
  isActive: boolean
}

interface AddonFormProps {
  initialData?: AdminAddon
}

// Styles added in the editor get a temporary "_new_..." client-side _id so
// React can key them before the backend assigns a real ObjectId. Sending
// that string as _id would fail Mongoose's ObjectId cast, so it's stripped
// here - only styles carrying a real, already-saved _id keep one.
function sanitizeStyles(styles: AdminAddonStyle[]) {
  return styles.map((s) => {
    const { _id, ...rest } = s
    return _id.startsWith("_new_") ? rest : { _id, ...rest }
  })
}

export function AddonForm({ initialData }: AddonFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?._id)
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name ?? "",
    styles: initialData?.styles ?? [],
    isActive: initialData?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const body = { name: formData.name, isActive: formData.isActive, styles: sanitizeStyles(formData.styles) }
    try {
      if (isEditing) {
        await apiFetch(`/addons/${initialData!._id}`, { method: "PUT", requireAdmin: true, body })
      } else {
        await apiFetch(`/addons`, { method: "POST", requireAdmin: true, body })
      }
      router.push("/admin/addons")
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialData?._id) return
    if (!window.confirm("Delete this addon? This can't be undone.")) return
    setDeleting(true)
    try {
      await apiFetch(`/addons/${initialData._id}`, { method: "DELETE", requireAdmin: true })
      router.push("/admin/addons")
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
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Shorts"
          className={inputClasses}
        />
      </div>

      <AddonStyleListEditor
        value={formData.styles}
        onChange={(styles) => setFormData((prev) => ({ ...prev, styles }))}
      />

      <label className="flex items-center gap-2 text-sm text-white">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4 accent-[var(--color-brand-green)]"
        />
        Active (shown to customers)
      </label>

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
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Addon"}
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
