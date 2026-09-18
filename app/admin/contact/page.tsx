"use client"

import { useEffect, useState } from "react"
import {
  ApiError,
  adminDeleteSubmission,
  adminListSubmissions,
  adminUpdateContactInfo,
  adminUpdateSubmissionStatus,
  getContactInfo,
} from "@/lib/api"
import type { ContactInfo } from "@/lib/contact-types"
import type { ContactSubmission } from "@/lib/contact-types"
import { SeoFieldsEditor } from "@/components/admin/gts-hub/SeoFieldsEditor"
import type { SeoFields } from "@/lib/gts-hub-types"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export default function AdminContactPage() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [mapEmbedUrl, setMapEmbedUrl] = useState("")
  const [seo, setSeo] = useState<SeoFields | undefined>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)

  function loadAll() {
    setLoading(true)
    Promise.all([getContactInfo(), adminListSubmissions()])
      .then(([info, subs]: [ContactInfo | null, ContactSubmission[]]) => {
        if (info) {
          setPhone(info.phone ?? "")
          setEmail(info.email ?? "")
          setAddress(info.address ?? "")
          setWhatsapp(info.whatsapp ?? "")
          setMapEmbedUrl(info.mapEmbedUrl ?? "")
          setSeo(info.seo)
        }
        setSubmissions(subs)
      })
      .catch((err: unknown) => setSubmissionsError(err instanceof ApiError ? err.message : "Failed to load."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await adminUpdateContactInfo({ phone, email, address, whatsapp, mapEmbedUrl, seo })
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  async function markRead(submission: ContactSubmission) {
    try {
      await adminUpdateSubmissionStatus(submission._id, "read")
      setSubmissions((prev) => prev.map((s) => (s._id === submission._id ? { ...s, status: "read" } : s)))
    } catch (err) {
      setSubmissionsError(err instanceof ApiError ? err.message : "Failed to update.")
    }
  }

  async function removeSubmission(submission: ContactSubmission) {
    if (!window.confirm("Delete this message? This can't be undone.")) return
    try {
      await adminDeleteSubmission(submission._id)
      setSubmissions((prev) => prev.filter((s) => s._id !== submission._id))
    } catch (err) {
      setSubmissionsError(err instanceof ApiError ? err.message : "Failed to delete.")
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Contact Us</h1>

      <section className="mb-10 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5">
        <h2 className="mb-4 text-lg font-bold text-white">Contact Info</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white">WhatsApp</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9779800000000"
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-white">Map Embed URL</label>
            <input
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              placeholder="Google Maps 'Embed a map' iframe src URL"
              className={inputClasses}
            />
          </div>

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
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Messages</h2>

        {submissionsError && <p className="mb-4 text-sm text-[var(--color-error-red)]">{submissionsError}</p>}
        {submissions.length === 0 && <p className="text-sm text-[var(--color-text-gray)]">No messages yet.</p>}

        <div className="flex flex-col gap-4">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">
                    {submission.name} · {submission.email}
                  </p>
                  <p className="text-xs text-[var(--color-text-gray)]">{formatDate(submission.createdAt)}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                    submission.status === "new"
                      ? "border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]"
                      : "border-[var(--glass-border)] text-[var(--color-text-gray)]"
                  }`}
                >
                  {submission.status}
                </span>
              </div>
              <p className="text-sm text-white">{submission.message}</p>
              <div className="flex gap-3 border-t border-[var(--glass-border)] pt-3">
                {submission.status === "new" && (
                  <button
                    type="button"
                    onClick={() => markRead(submission)}
                    className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeSubmission(submission)}
                  className="text-xs font-semibold text-[var(--color-error-red)] hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
