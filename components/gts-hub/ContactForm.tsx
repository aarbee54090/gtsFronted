"use client"

import { useState } from "react"
import { ApiError, submitContactMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"

const LIMITS = { name: 100, email: 200, message: 5000 }

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
      setError("Please fill in your name, email, and message.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
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
      setError(err instanceof ApiError ? err.message : "Failed to send message. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p role="status" className="notice notice-success">
        Thanks - your message has been sent. We&apos;ll reply to the email address you gave.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="contact-name" className="field-label">
          Name
        </label>
        <input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={LIMITS.name}
          required
          className="field-input"
        />
      </div>
      <div className="field">
        <label htmlFor="contact-email" className="field-label">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          maxLength={LIMITS.email}
          required
          className="field-input"
        />
      </div>
      <div className="field">
        <label htmlFor="contact-message" className="field-label">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={LIMITS.message}
          required
          className="field-input"
        />
      </div>

      {error && (
        <p role="alert" className="field-error text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  )
}
