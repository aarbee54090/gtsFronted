import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CardPhoto } from "@/components/shared/CardPhoto"
import { SaveButton } from "@/components/account/SaveButton"
import type { PortfolioProject } from "@/lib/gts-hub-types"
import { projectClient, projectCoverImage, projectMeta, projectPath, projectTitle } from "@/lib/our-work"
import { usableImageUrl } from "@/lib/seo"

interface ProjectCardProps {
  project: PortfolioProject
  /** h2 directly under a page h1 (the Our Work list), h3 under a section h2. */
  titleAs?: "h2" | "h3"
}

/**
 * One completed project. The whole card is a link; the save (heart) button
 * sits beside the link rather than inside it, since a button nested in a
 * link is invalid and confuses screen readers.
 */
export function ProjectCard({ project, titleAs: Title = "h3" }: ProjectCardProps) {
  const title = projectTitle(project)
  const meta = projectMeta(project)
  const client = projectClient(project)
  const image = projectCoverImage(project)

  return (
    <article className="group surface-card surface-card-interactive relative flex flex-col overflow-hidden">
      <Link href={projectPath(project)} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
          <CardPhoto
            src={image}
            // The admin's separate mobile crop belongs to the thumbnail, so
            // it only applies when the thumbnail is the cover.
            mobileSrc={image && image === usableImageUrl(project.thumbnailImageUrl) ? project.thumbnailImageUrlMobile : undefined}
            alt={`${title}${meta ? ` - ${meta}` : ""}`}
            sizes="(max-width: 1024px) 50vw, 33vw"
            mobileSizes="100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          {meta && <p className="eyebrow">{meta}</p>}
          <Title className="card-title">{title}</Title>
          {(client || project.quantity) && (
            <p className="card-text">
              {[client, project.quantity ? `${project.quantity} pcs` : null].filter(Boolean).join(" · ")}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-[var(--color-brand-green)]">
            View project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
      <SaveButton
        itemType="portfolio"
        itemId={project._id}
        name={title}
        imageUrl={image}
        slug={project.slug}
        className="absolute right-3 top-3 z-10"
      />
    </article>
  )
}
