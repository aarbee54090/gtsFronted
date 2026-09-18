"use client"

import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { RequireCustomer } from "@/components/account/RequireCustomer"
import { AccountNav } from "@/components/account/AccountNav"
import { useSavedDesigns } from "@/components/account/SavedDesignsContext"
import { SaveButton } from "@/components/account/SaveButton"
import { HUB_BASE_PATH } from "@/lib/gts-hub-card-helpers"
import type { ContentType } from "@/lib/gts-hub-types"

function SavedDesignsList() {
  const { savedDesigns } = useSavedDesigns()

  if (savedDesigns.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-gray)]">
        Nothing saved yet - tap the heart icon on any design to save it here.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {savedDesigns.map((item) => {
        // Catalog (customizer) designs resume in the customizer itself,
        // pre-selected via "?design=". GTS Hub content types link to their
        // own detail page as before.
        const href =
          item.itemType === "catalog"
            ? item.categoryId && item.sportSlug
              ? `/customize/${item.categoryId}/${item.sportSlug}?design=${encodeURIComponent(item.itemId)}`
              : null
            : item.slug
              ? `${HUB_BASE_PATH[item.itemType as ContentType]}/${item.slug}`
              : null
        const content = (
          <div className="glass-surface flex flex-col overflow-hidden rounded-[var(--radius-lg)] transition-colors hover:border-[var(--color-brand-green)]">
            <div className="relative aspect-[4/3] w-full bg-black/40">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized={item.imageUrl.startsWith("data:")} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-600">No image</div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="truncate text-sm font-semibold text-white">{item.name}</p>
              <SaveButton itemType={item.itemType} itemId={item.itemId} name={item.name} imageUrl={item.imageUrl} />
            </div>
          </div>
        )

        return href ? (
          <Link key={item._id} href={href}>
            {content}
          </Link>
        ) : (
          <div key={item._id}>{content}</div>
        )
      })}
    </div>
  )
}

export default function SavedDesignsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg-dark)] text-[var(--color-text-white)]">
      <AmbientBackground />
      <Navbar />
      <div className="mx-auto max-w-[900px] px-6 pb-24 pt-32">
        <h1 className="mb-6 text-3xl font-bold text-white">Saved Designs</h1>
        <RequireCustomer>
          <AccountNav />
          <SavedDesignsList />
        </RequireCustomer>
      </div>
    </div>
  )
}
