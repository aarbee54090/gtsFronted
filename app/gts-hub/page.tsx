import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { PlatformCard } from "@/components/gts-hub/PlatformCard"
import { getPublishedPlatforms, getHubSectionImages } from "@/lib/api"
import type { HubSectionImage, HubSectionKey } from "@/lib/hub-section-image-types"

export const metadata: Metadata = {
  title: "GTS Hub | GoalThali Sports",
  description:
    "Explore real projects, the latest designs, jersey-making guides, and the materials behind every GTS jersey.",
}

const SECTIONS: { key: HubSectionKey; href: string; title: string; description: string }[] = [
  {
    key: "portfolio",
    href: "/gts-hub/portfolio",
    title: "Portfolio",
    description: "Real GTS work - completed projects for teams, colleges, and clubs.",
  },
  {
    key: "new-arrivals",
    href: "/gts-hub/new-arrivals",
    title: "New Arrivals",
    description: "Our latest designs and collections.",
  },
  {
    key: "materials",
    href: "/gts-hub/materials",
    title: "Materials",
    description: "The fabrics and materials behind every GTS product.",
  },
  {
    key: "journal",
    href: "/gts-hub/journal",
    title: "Journal",
    description: "Guides, behind-the-scenes, and everything jersey-making.",
  },
  {
    key: "about",
    href: "/gts-hub/about",
    title: "About Us",
    description: "Who we are and what GTS is about.",
  },
  {
    key: "contact",
    href: "/gts-hub/contact",
    title: "Contact Us",
    description: "Get in touch with the GTS team.",
  },
]

export default async function GtsHubPage() {
  const [platforms, sectionImages] = await Promise.all([getPublishedPlatforms(), getHubSectionImages()])
  const imageByKey = new Map<HubSectionKey, HubSectionImage>(sectionImages.map((img) => [img.sectionKey, img]))

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <section className="mx-auto max-w-[1100px] px-4 pb-20 pt-24">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand-green)]">GTS Hub</span>
          <h1 className="text-4xl font-bold text-white">Explore the world of GTS</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SECTIONS.map((section) => {
            const img = imageByKey.get(section.key)
            const hasMobile = Boolean(img?.mobileImageUrl)
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group glass-2 flex h-56 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-brand-green)] hover:shadow-[0_0_32px_rgba(182,255,0,0.18)]"
              >
                {img?.desktopImageUrl ? (
                  <>
                    {hasMobile && (
                      <Image
                        src={img!.mobileImageUrl!}
                        alt={section.title}
                        fill
                        sizes="100vw"
                        className="block object-cover transition-transform duration-300 group-hover:scale-105 sm:hidden"
                      />
                    )}
                    <Image
                      src={img.desktopImageUrl}
                      alt={section.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className={
                        hasMobile
                          ? "hidden object-cover transition-transform duration-300 group-hover:scale-105 sm:block"
                          : "object-cover transition-transform duration-300 group-hover:scale-105"
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at 50% 30%, rgba(182,255,0,0.08), transparent 70%)" }}
                  />
                )}

                <div className="glass-3 z-[1] flex min-h-[76px] flex-col justify-center gap-1 rounded-[var(--radius-md)] bg-[var(--glass-bg-soft)] p-3">
                  <h2 className="line-clamp-1 text-xl font-bold text-white">{section.title}</h2>
                  <p className="line-clamp-2 text-sm text-[var(--color-text-gray)]">{section.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {platforms.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand-green)]">
                Our Platforms
              </span>
              <h2 className="text-3xl font-bold text-white">Everything GTS, connected.</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {platforms.map((platform) => (
                <PlatformCard key={platform._id} platform={platform} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
