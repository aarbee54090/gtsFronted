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

// The optional structured address + visit fields. Kept as one object so the
// form below can render them from this list.
const DETAIL_FIELDS = [
  { key: "streetAddress", label: "Street / area", placeholder: "e.g. Kalanki" },
  { key: "addressLocality", label: "City", placeholder: "e.g. Kathmandu" },
  { key: "addressRegion", label: "Province", placeholder: "e.g. Bagmati" },
  { key: "postalCode", label: "Postal code", placeholder: "Optional" },
  { key: "openingHours", label: "Opening hours (shown on the site)", placeholder: "e.g. Sun-Fri 10:00-18:00" },
  { key: "mapsUrl", label: "Google Maps link (for 'Get directions')", placeholder: "https://maps.app.goo.gl/..." },
] as const

type DetailKey = (typeof DETAIL_FIELDS)[number]["key"]

export default function AdminContactPage() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [mapEmbedUrl, setMapEmbedUrl] = useState("")
  const [details, setDetails] = useState<Record<DetailKey, string>>({
    streetAddress: "",
    addressLocality: "",
    addressRegion: "",
    postalCode: "",
    openingHours: "",
    mapsUrl: "",
  })
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
          setDetails({
            streetAddress: info.streetAddress ?? "",
            addressLocality: info.addressLocality ?? "",
            addressRegion: info.addressRegion ?? "",
            postalCode: info.postalCode ?? "",
            openingHours: info.openingHours ?? "",
            mapsUrl: info.mapsUrl ?? "",
          })
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
      const updated = await adminUpdateContactInfo({ phone, email, address, whatsapp, mapEmbedUrl, ...details, seo })
      // The backend trims a pasted <iframe> down to its URL - show what was kept.
      setMapEmbedUrl(updated.mapEmbedUrl ?? "")
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
              <label htmlFor="contact-phone" className="text-sm font-semibold text-white">Phone</label>
              <input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-sm font-semibold text-white">Email</label>
              <input id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-whatsapp" className="text-sm font-semibold text-white">WhatsApp</label>
              <input
                id="contact-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9779800000000"
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-address" className="text-sm font-semibold text-white">Address (as shown on the site)</label>
              <input id="contact-address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
            </div>
          </div>

          <fieldset className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-4">
            <legend className="px-1 text-sm font-semibold text-white">Address details &amp; visits</legend>
            <p className="text-xs text-[var(--color-text-gray)]">
              Optional. When <strong>City</strong> is filled in, the Contact page also tells search engines your business
              address (LocalBusiness structured data) - so only enter the real, current address.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DETAIL_FIELDS.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <label htmlFor={`contact-${field.key}`} className="text-sm font-semibold text-white">
                    {field.label}
                  </label>
                  <input
                    id={`contact-${field.key}`}
                    value={details[field.key]}
                    onChange={(e) => setDetails((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className={inputClasses}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-map" className="text-sm font-semibold text-white">Map Embed URL</label>
            <input
              id="contact-map"
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              placeholder="Google Maps 'Embed a map' iframe src URL"
              className={inputClasses}
            />
            <p className="text-xs text-[var(--color-text-gray)]">
              Pasting the whole &lt;iframe&gt; code is fine - only its link is saved.
            </p>
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
