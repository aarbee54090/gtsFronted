"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import type { ContentTypeConfig, FieldConfig } from "@/lib/gts-hub-field-config-types"
import type { MediaItem, RelatedContentRef, SeoFields } from "@/lib/gts-hub-types"
import { TagsInput } from "./TagsInput"
import { MediaListEditor, SingleMediaEditor } from "./MediaListEditor"
import { SeoFieldsEditor } from "./SeoFieldsEditor"
import { TiptapEditor } from "./TiptapEditor"
import { RelatedContentPicker } from "./RelatedContentPicker"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Loose shape - this form works generically across 4 different Mongoose
// schemas, so it deliberately doesn't try to type every possible field.
type FormData = Record<string, unknown> & {
  slug?: string
  tags?: string[]
  relatedContent?: RelatedContentRef[]
  seo?: SeoFields
  status?: "draft" | "published"
  featured?: boolean
}

interface ContentFormProps {
  config: ContentTypeConfig
  initialData?: FormData & { _id: string }
}

export function ContentForm({ config, initialData }: ContentFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?._id)
  const [formData, setFormData] = useState<FormData>(() => ({
    tags: [],
    relatedContent: [],
    seo: {},
    status: "draft",
    featured: false,
    ...initialData,
  }))
  const [slugTouched, setSlugTouched] = useState(isEditing) // don't auto-slug over an existing item
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(key: string, value: unknown) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-fill slug from the title/name field until the admin edits the
      // slug directly themselves (per the locked "auto-generate, editable"
      // decision).
      if (key === config.titleField && !slugTouched) {
        next.slug = slugify(String(value ?? ""))
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEditing) {
        await apiFetch(`${config.apiBasePath}/${initialData!._id}`, {
          method: "PUT",
          requireAdmin: true,
          body: formData,
        })
      } else {
        await apiFetch(`${config.apiBasePath}`, {
          method: "POST",
          requireAdmin: true,
          body: formData,
        })
      }
      router.push(config.adminBasePath)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialData?._id) return
    if (!window.confirm(`Delete this ${config.label.toLowerCase()}? This can't be undone.`)) return
    setDeleting(true)
    try {
      await apiFetch(`${config.apiBasePath}/${initialData._id}`, { method: "DELETE", requireAdmin: true })
      router.push(config.adminBasePath)
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete.")
      setDeleting(false)
    }
  }

  function renderField(field: FieldConfig) {
    const value = formData[field.key]

    switch (field.kind) {
      case "text":
        return (
          <input
            value={(value as string) ?? ""}
            onChange={(e) => setField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={inputClasses}
          />
        )
      case "textarea":
        return (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => setField(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${inputClasses} resize-none`}
          />
        )
      case "number":
        return (
          <input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => setField(field.key, e.target.value === "" ? undefined : Number(e.target.value))}
            className={`${inputClasses} max-w-[160px]`}
          />
        )
      case "select":
        return (
          <select value={(value as string) ?? ""} onChange={(e) => setField(field.key, e.target.value)} className={inputClasses}>
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )
      case "tags":
        return (
          <TagsInput
            label=""
            value={(value as string[]) ?? []}
            onChange={(v) => setField(field.key, v)}
            placeholder={field.placeholder}
          />
        )
      case "media-list":
        return <MediaListEditor label="" value={(value as MediaItem[]) ?? []} onChange={(v) => setField(field.key, v)} />
      case "media-single":
        return (
          <SingleMediaEditor label="" value={value as MediaItem | undefined} onChange={(v) => setField(field.key, v)} />
        )
      case "richtext":
        return <TiptapEditor label="" value={value as string | undefined} onChange={(v) => setField(field.key, v)} />
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setField(field.key, e.target.checked)}
            className="h-4 w-4"
          />
        )
      default:
        return null
    }
  }

  const criteria = {
    sport: config.relatedCriteriaFields.sport ? (formData[config.relatedCriteriaFields.sport] as string) : undefined,
    productType: config.relatedCriteriaFields.productType
      ? (formData[config.relatedCriteriaFields.productType] as string)
      : undefined,
    tags: config.relatedCriteriaFields.tags ? (formData[config.relatedCriteriaFields.tags] as string[]) : undefined,
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Tags is rendered separately below (shared by all types), so skip it here to avoid duplicating the field */}
      {config.fields
        .filter((f) => f.key !== "tags")
        .map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">
              {field.label}
              {field.required && <span className="ml-1 text-[var(--color-error-red)]">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">Slug</label>
        <input
          value={formData.slug ?? ""}
          onChange={(e) => {
            setSlugTouched(true)
            setFormData((prev) => ({ ...prev, slug: e.target.value }))
          }}
          placeholder="auto-generated-from-title"
          className={inputClasses}
        />
      </div>

      {config.fields.some((f) => f.key === "tags") && (
        <TagsInput label="Tags" value={formData.tags ?? []} onChange={(v) => setFormData((prev) => ({ ...prev, tags: v }))} />
      )}

      <RelatedContentPicker
        value={formData.relatedContent ?? []}
        onChange={(v) => setFormData((prev) => ({ ...prev, relatedContent: v }))}
        criteria={criteria}
        excludeType={config.contentType}
        excludeId={initialData?._id}
      />

      <SeoFieldsEditor value={formData.seo} onChange={(v) => setFormData((prev) => ({ ...prev, seo: v }))} />

      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-4">
        <div className="flex items-center gap-6">
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
          <label className="flex items-center gap-2 text-sm font-semibold text-white">
            <input
              type="checkbox"
              checked={Boolean(formData.featured)}
              onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4"
            />
            Featured
          </label>
        </div>
        {formData.status === "draft" && (
          <p className="rounded-[var(--radius-sm)] border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-400">
            This is a draft — it will NOT appear on the public GTS Hub until you set Status to Published.
          </p>
        )}
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
          {saving ? "Saving..." : isEditing ? "Save Changes" : `Create ${config.label}`}
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
