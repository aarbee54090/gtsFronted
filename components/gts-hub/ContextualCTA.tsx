import Link from "next/link"

export function ContextualCTA() {
  return (
    <div className="glass-surface flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-8 text-center">
      <h3 className="text-lg font-bold text-white">Ready to create your own?</h3>
      <p className="text-sm text-[var(--color-text-gray)]">
        Design custom jerseys, tracksuits, and gym wear for your team.
      </p>
      <Link
        href="/customize"
        className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)]"
      >
        Customize Now
      </Link>
    </div>
  )
}
