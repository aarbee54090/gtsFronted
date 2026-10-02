import { HubExplore } from "@/components/gts-hub/HubExplore"
import { SectionHeader } from "@/components/site/SectionHeader"
import type { HubSectionImage } from "@/lib/hub-section-image-types"
import type { Platform } from "@/lib/platform-types"

/**
 * The full GTS Hub - every hub section and Our Platforms - on the homepage.
 * Same component as /gts-hub itself, under a homepage section heading.
 */
export function HubSection({ sectionImages, platforms }: { sectionImages: HubSectionImage[]; platforms: Platform[] }) {
  return (
    <section aria-labelledby="hub-heading" className="section">
      <div className="container-site">
        <SectionHeader
          id="hub-heading"
          eyebrow="GTS Hub"
          title="Explore the world of GTS"
          description="Real projects, new designs, fabric guides, and the story behind GoalThali Sports."
          action={{ href: "/gts-hub", label: "Open the GTS Hub" }}
        />
        <HubExplore sectionImages={sectionImages} platforms={platforms} headingLevel="h3" />
      </div>
    </section>
  )
}
