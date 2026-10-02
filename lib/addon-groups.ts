import type { Addon, AddonStyle } from "./types"

/** One thing a customer can add: a single style, still tied to its own addon since pricing looks styles up through it. */
export interface AddonItem {
  addonId: string
  style: AddonStyle
}

export interface AddonGroup {
  name: string
  items: AddonItem[]
}

/**
 * Admins sometimes create a separate addon per variant ("Shorts" with
 * "Number print", then another "Shorts" with "Stripes") instead of adding
 * styles to one. Customers should still see a single "Shorts" group, so
 * addons are merged by name (trimmed, case-insensitive) in first-seen order.
 */
export function groupAddonsByName(addons: Addon[]): AddonGroup[] {
  const groups = new Map<string, AddonGroup>()
  for (const addon of addons) {
    if (addon.styles.length === 0) continue // nothing to pick - fetchAddons drops these too
    const name = addon.name.trim()
    const key = name.toLowerCase()
    let group = groups.get(key)
    if (!group) {
      group = { name, items: [] }
      groups.set(key, group)
    }
    for (const style of addon.styles) group.items.push({ addonId: addon.id, style })
  }
  return [...groups.values()]
}
