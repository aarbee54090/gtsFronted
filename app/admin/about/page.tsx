"use client"

import { useEffect, useState } from "react"
import { ApiError, adminUpdateAboutPage, getAboutPage } from "@/lib/api"
import type { AboutPage } from "@/lib/about-types"
import type { MediaItem, SeoFields } from "@/lib/gts-hub-types"
import { TiptapEditor } from "@/components/admin/gts-hub/TiptapEditor"
import { SeoFieldsEditor } from "@/components/admin/gts-hub/SeoFieldsEditor"
import { SingleMediaEditor } from "@/components/admin/gts-hub/MediaListEditor"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

export default function AdminAboutPage() {
  const [heading, setHeading] = useState("")
  const [body, setBody] = useState("")
  const [heroImage, setHeroImage] = useState<MediaItem | undefined>()
  const [seo, setSeo] = useState<SeoFields | undefined>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getAboutPage()
      .then((page: AboutPage | null) => {
        if (!page) return
        setHeading(page.heading ?? "")
        setBody(page.body ?? "")
        setHeroImage(page.heroImage)
        setSeo(page.seo)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await adminUpdateAboutPage({ heading, body, heroImage, seo })
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">About Us</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Heading</label>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Who We Are"
            className={inputClasses}
          />
        </div>

        <TiptapEditor label="Body" value={body} onChange={setBody} />

        <SingleMediaEditor label="Hero Image" value={heroImage} onChange={setHeroImage} />

        <SeoFieldsEditor value={seo} onChange={setSeo} />

        {error && (
          <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
            {error}
          </p>
        )}
        {saved && <p className="text-sm text-[var(--color-brand-green)]">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
