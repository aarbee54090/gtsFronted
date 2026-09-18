"use client"

import { useState } from "react"
import { ApiError, submitContactMessage } from "@/lib/api"

const inputClasses =
  "w-full rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-[var(--color-brand-green)] focus:outline-none"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("All fields are required.")
      return
    }

    setSubmitting(true)
    try {
      await submitContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() })
      setSubmitted(true)
      setName("")
      setEmail("")
      setMessage("")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send message.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/10 px-5 py-4 text-sm text-[var(--color-brand-green)]">
        Thanks — your message has been sent. We&apos;ll get back to you soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={`${inputClasses} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-[var(--color-error-red)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
