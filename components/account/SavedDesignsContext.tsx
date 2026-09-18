"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { apiFetch } from "@/lib/api"
import type { SavedDesign } from "@/lib/saved-design-types"
import { useCustomerAuth } from "./CustomerAuthContext"

type SaveInput = {
  itemType: SavedDesign["itemType"]
  itemId: string
  name: string
  imageUrl?: string
  categoryId?: string
  sportSlug?: string
  slug?: string
}

interface SavedDesignsContextValue {
  savedDesigns: SavedDesign[]
  isSaved: (itemType: SavedDesign["itemType"], itemId: string) => boolean
  toggleSave: (item: SaveInput) => Promise<void>
}

const SavedDesignsContext = createContext<SavedDesignsContextValue | null>(null)

export function SavedDesignsProvider({ children }: { children: ReactNode }) {
  const { customer } = useCustomerAuth()
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])

  const refresh = useCallback(async () => {
    if (!customer) {
      setSavedDesigns([])
      return
    }
    try {
      const res = await apiFetch<{ success: boolean; data: SavedDesign[] }>("/saved-designs")
      setSavedDesigns(res.data)
    } catch {
      setSavedDesigns([])
    }
  }, [customer])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isSaved = useCallback(
    (itemType: SavedDesign["itemType"], itemId: string) =>
      savedDesigns.some((d) => d.itemType === itemType && d.itemId === itemId),
    [savedDesigns]
  )

  // Deliberately does NOT gate on `customer` here - it's called both from
  // SaveButton (which already checks first) and from AccountAuthForm right
  // after register/login, where the session cookie is already set on the
  // browser but this component's own `customer` state may not have
  // re-rendered yet. The API call itself is the real auth check.
  const toggleSave = useCallback(
    async (item: SaveInput) => {
      const alreadySaved = isSaved(item.itemType, item.itemId)

      if (alreadySaved) {
        setSavedDesigns((prev) => prev.filter((d) => !(d.itemType === item.itemType && d.itemId === item.itemId)))
        await apiFetch(`/saved-designs/${item.itemType}/${item.itemId}`, { method: "DELETE" }).catch(() => refresh())
      } else {
        const res = await apiFetch<{ success: boolean; data: SavedDesign }>("/saved-designs", {
          method: "POST",
          body: item,
        }).catch(() => null)
        if (res) setSavedDesigns((prev) => [res.data, ...prev])
      }
    },
    [isSaved, refresh]
  )

  return (
    <SavedDesignsContext.Provider value={{ savedDesigns, isSaved, toggleSave }}>
      {children}
    </SavedDesignsContext.Provider>
  )
}

export function useSavedDesigns(): SavedDesignsContextValue {
  const ctx = useContext(SavedDesignsContext)
  if (!ctx) throw new Error("useSavedDesigns must be used within a SavedDesignsProvider")
  return ctx
}
