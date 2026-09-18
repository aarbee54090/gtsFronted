"use client"

import { useEffect, useState } from "react"
import { ApiError, adminDeleteHubSectionImage, adminUpsertHubSectionImage, getHubSectionImages } from "@/lib/api"
import { HUB_SECTION_KEYS, HUB_SECTION_LABELS, type HubSectionImage, type HubSectionKey } from "@/lib/hub-section-image-types"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

type DraftMap = Record<HubSectionKey, { desktopImageUrl: string; mobileImageUrl: string }>

function emptyDrafts(): DraftMap {
  return HUB_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = { desktopImageUrl: "", mobileImageUrl: "" }
    return acc
  }, {} as DraftMap)
}

export default function AdminHubImagesPage() {
  const [drafts, setDrafts] = useState<DraftMap>(emptyDrafts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingKey, setSavingKey] = useState<HubSectionKey | null>(null)
  const [savedKey, setSavedKey] = useState<HubSectionKey | null>(null)

  useEffect(() => {
    getHubSectionImages()
      .then((items: HubSectionImage[]) => {
        setDrafts((prev) => {
          const next = { ...prev }
          for (const item of items) {
            next[item.sectionKey] = {
              desktopImageUrl: item.desktopImageUrl ?? "",
              mobileImageUrl: item.mobileImageUrl ?? "",
            }
          }
          return next
        })
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Failed to load."))
      .finally(() => setLoading(false))
  }, [])

  function setField(key: HubSectionKey, field: "desktopImageUrl" | "mobileImageUrl", value: string) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function handleSave(key: HubSectionKey) {
    setSavingKey(key)
    setSavedKey(null)
    setError(null)
    try {
      await adminUpsertHubSectionImage(key, {
        desktopImageUrl: drafts[key].desktopImageUrl || undefined,
        mobileImageUrl: drafts[key].mobileImageUrl || undefined,
      })
      setSavedKey(key)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.")
    } finally {
      setSavingKey(null)
    }
  }

  async function handleClear(key: HubSectionKey) {
    setSavingKey(key)
    setSavedKey(null)
    setError(null)
    try {
      await adminDeleteHubSectionImage(key)
      setDrafts((prev) => ({ ...prev, [key]: { desktopImageUrl: "", mobileImageUrl: "" } }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clear.")
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">GTS Hub Card Images</h1>
      <p className="mb-8 text-sm text-[var(--color-text-gray)]">
        The background photo shown on each card on the /gts-hub landing page. Paste a Cloudinary URL for desktop,
        and optionally a different crop for mobile — falls back to the desktop image if left blank.
      </p>

      {error && (
        <p className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {HUB_SECTION_KEYS.map((key) => (
          <section
            key={key}
            className="rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5"
          >
            <h2 className="mb-4 text-lg font-bold text-white">{HUB_SECTION_LABELS[key]}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">Desktop Image URL</label>
                <input
                  value={drafts[key].desktopImageUrl}
                  onChange={(e) => setField(key, "desktopImageUrl", e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className={inputClasses}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">Mobile Image URL</label>
                <input
                  value={drafts[key].mobileImageUrl}
                  onChange={(e) => setField(key, "mobileImageUrl", e.target.value)}
                  placeholder="Optional - falls back to desktop image"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave(key)}
                disabled={savingKey === key}
                className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
              >
                {savingKey === key ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => handleClear(key)}
                disabled={savingKey === key}
                className="rounded-[var(--radius-pill)] border border-[var(--color-error-red)] px-5 py-2 text-sm font-bold text-[var(--color-error-red)] disabled:opacity-40"
              >
                Clear
              </button>
              {savedKey === key && <span className="text-sm text-[var(--color-brand-green)]">Saved.</span>}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
