"use client"

import { useRouter, usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { useCustomerAuth } from "./CustomerAuthContext"
import { useSavedDesigns } from "./SavedDesignsContext"
import { setPendingAction } from "@/lib/pending-action"
import type { SavedDesign } from "@/lib/saved-design-types"

interface SaveButtonProps {
  itemType: SavedDesign["itemType"]
  itemId: string
  name: string
  imageUrl?: string
  /** Only meaningful for itemType "catalog" - lets a saved design link back to the right customizer page. */
  categoryId?: string
  sportSlug?: string
  /** Only meaningful for GTS Hub content types - detail pages route by slug, not itemId. */
  slug?: string
  className?: string
}

export function SaveButton({ itemType, itemId, name, imageUrl, categoryId, sportSlug, slug, className = "" }: SaveButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { customer } = useCustomerAuth()
  const { isSaved, toggleSave } = useSavedDesigns()
  const saved = isSaved(itemType, itemId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault() // these buttons commonly sit inside a <Link> card
    e.stopPropagation()

    if (!customer) {
      // Register-first (not login-first): most guests tapping a heart are
      // new here. The intended save is stashed so it completes automatically
      // once they're registered, instead of being silently dropped.
      setPendingAction({ type: "save-design", itemType, itemId, name, imageUrl, categoryId, sportSlug, slug })
      router.push(`/account/register?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    toggleSave({ itemType, itemId, name, imageUrl, categoryId, sportSlug, slug })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved designs` : `Save ${name}`}
      className={`flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-[8px] transition-colors ${
        saved
          ? "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)]"
          : "border-[var(--glass-border)] bg-black/30 text-white hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
      } ${className}`}
    >
      <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
    </button>
  )
}
