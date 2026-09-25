import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { HubMedia } from "@/components/gts-hub/HubMedia"
import { getAboutPage } from "@/lib/api"
import { buildMetadata } from "@/lib/gts-hub-metadata"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage()
  return buildMetadata({
    seo: page?.seo,
    fallbackTitle: page?.heading || "About Us",
    fallbackDescription: "Who we are and what GTS is about.",
  })
}

export default async function AboutPage() {
  const page = await getAboutPage()

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />

      <div className="mx-auto max-w-[720px] px-6 pb-24 pt-32">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
          About Us
        </p>
        <h1 className="mb-8 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          {page?.heading || "Who We Are"}
        </h1>

        {page?.heroImage?.url && (
          <HubMedia media={page.heroImage} className="mb-10 w-full rounded-[var(--radius-lg)] object-cover" />
        )}

        {page?.body ? (
          // Admin-authored HTML from the Tiptap editor, not user-generated -
          // safe to render directly.
          <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: page.body }} />
        ) : (
          <p className="text-base text-[var(--color-text-gray)]">This page hasn&apos;t been set up yet.</p>
        )}
      </div>
    </div>
  )
}
