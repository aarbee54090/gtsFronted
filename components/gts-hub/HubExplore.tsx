import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PlatformCard } from "./PlatformCard"
import { CardPhoto } from "@/components/shared/CardPhoto"
import type { HubSectionImage, HubSectionKey } from "@/lib/hub-section-image-types"
import type { Platform } from "@/lib/platform-types"

// Every GTS Hub section, in the order the hub shows them. The background
// images come from Admin -> Hub Card Images.
export const HUB_SECTIONS: { key: HubSectionKey; href: string; title: string; description: string }[] = [
  {
    key: "portfolio",
    href: "/gts-hub/portfolio",
    title: "Our Work",
    description: "Completed projects for schools, clubs, and teams.",
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
    title: "Contact & Visits",
    description: "Reach the GTS team or book a time to visit.",
  },
]

interface HubExploreProps {
  sectionImages: HubSectionImage[]
  platforms: Platform[]
  /** Heading level of the cards: h2 directly under the /gts-hub h1, h3 inside a homepage section. */
  headingLevel?: "h2" | "h3"
}

/**
 * The GTS Hub experience - a card for every hub section (with the admin's
 * card images) and the "Our Platforms" links. The /gts-hub page and the
 * homepage both render this one component, so they never drift apart.
 */
export function HubExplore({ sectionImages, platforms, headingLevel = "h2" }: HubExploreProps) {
  const imageByKey = new Map<HubSectionKey, HubSectionImage>(sectionImages.map((img) => [img.sectionKey, img]))
  const CardTitle = headingLevel
  const PlatformsTitle = headingLevel

  return (
    <div className="flex flex-col gap-16">
      <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_SECTIONS.map((section) => {
          const img = imageByKey.get(section.key)
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className="group surface-card surface-card-interactive relative flex h-56 flex-col justify-end overflow-hidden p-5 sm:h-60"
              >
                {img?.desktopImageUrl || img?.mobileImageUrl ? (
                  <>
                    {/* Decorative: the card's title says where it goes. */}
                    <CardPhoto
                      src={img.desktopImageUrl}
                      mobileSrc={img.mobileImageUrl}
                      alt=""
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at 70% 20%, rgba(182,255,0,0.08), transparent 65%)" }}
                  />
                )}

                <div className="relative z-[1] flex items-end justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="card-title text-xl">{section.title}</CardTitle>
                    <p className="line-clamp-2 text-[15px] leading-snug text-white/80">{section.description}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-[var(--color-brand-green)] transition-colors group-hover:border-[var(--color-brand-green)]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {platforms.length > 0 && (
        <div>
          <div className="mb-6 flex flex-col gap-2">
            <p className="eyebrow">Our Platforms</p>
            <PlatformsTitle className="card-title text-xl">Everything GTS, connected</PlatformsTitle>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {platforms.map((platform) => (
              <PlatformCard key={platform._id} platform={platform} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
