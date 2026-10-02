import { afterEach, beforeEach, describe, it, expect, vi } from "vitest"

// lib/api.ts refuses to load without an API URL; tests never reach it anyway
// because fetch is stubbed below.
const { API } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL ??= "http://api.test/api"
  return { API: process.env.NEXT_PUBLIC_API_URL }
})

import { fetchProductByCategorySport } from "@/lib/api"

// Shaped like the live catalog.
const CATEGORY_LISTS: Record<string, { _id: string; name: string; category: string; sport: string }[]> = {
  "T-shirt Custom Designed": [{ _id: "p-polo", name: "T-shirt", category: "T-shirt Custom Designed", sport: "POLO T-SHIRT" }],
  "Jerseys Custom Designed": [
    { _id: "p-football", name: "Football Custom Design jersey", category: "Jerseys Custom Designed", sport: "Football" },
    { _id: "p-volleyball", name: "Volleyball Custom Design Jersey", category: "Jerseys Custom Designed", sport: "volleyball" },
  ],
}
const FULL_PRODUCTS: Record<string, object> = {
  "p-polo": { _id: "p-polo", name: "T-shirt", category: "T-shirt Custom Designed", sport: "POLO T-SHIRT", designs: [], pricingTiers: [], isActive: true },
  "p-football": { _id: "p-football", name: "Football Custom Design jersey", category: "Jerseys Custom Designed", sport: "Football", designs: [], pricingTiers: [], isActive: true },
  "p-volleyball": { _id: "p-volleyball", name: "Volleyball Custom Design Jersey", category: "Jerseys Custom Designed", sport: "volleyball", designs: [], pricingTiers: [], isActive: false },
}

const jsonResponse = (status: number, body: unknown) => ({ ok: status < 400, status, json: async () => body })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async (url: string) => {
    const path = url.slice(API.length)
    const list = path.match(/^\/products\/category\/([^/]+)$/)
    if (list) return jsonResponse(200, { data: CATEGORY_LISTS[decodeURIComponent(list[1])] ?? [] })
    const byId = path.match(/^\/products\/([^/]+)$/)
    if (byId) {
      const product = FULL_PRODUCTS[decodeURIComponent(byId[1])]
      return product ? jsonResponse(200, { data: product }) : jsonResponse(404, { message: "Product not found" })
    }
    return jsonResponse(404, {})
  })
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const requestedPaths = () => fetchMock.mock.calls.map(([url]) => String(url).slice(API.length))

describe("fetchProductByCategorySport", () => {
  it("resolves the Polo T-shirt route: slug match in the category list, then load by id", async () => {
    const product = await fetchProductByCategorySport("T-shirt Custom Designed", "polo-t-shirt")
    expect(product?.sport).toBe("POLO T-SHIRT")
    expect(requestedPaths()).toEqual(["/products/category/T-shirt%20Custom%20Designed", "/products/p-polo"])
  })

  it("accepts the sport segment in any case or with spaces", async () => {
    for (const sport of ["POLO T-SHIRT", "Polo-T-Shirt"]) {
      expect((await fetchProductByCategorySport("T-shirt Custom Designed", sport))?._id).toBe("p-polo")
    }
  })

  it("looks up a valid single-word sport", async () => {
    expect((await fetchProductByCategorySport("Jerseys Custom Designed", "football"))?._id).toBe("p-football")
  })

  it("returns null for an unknown sport or category without a second request", async () => {
    expect(await fetchProductByCategorySport("Jerseys Custom Designed", "kabaddi")).toBeNull()
    expect(await fetchProductByCategorySport("Track-suit Custom Designed", "football")).toBeNull()
    expect(requestedPaths().every((path) => path.startsWith("/products/category/"))).toBe(true)
  })

  it("never forwards URL input to the backend as a lookup pattern", async () => {
    expect(await fetchProductByCategorySport("Jerseys Custom Designed", ".*")).toBeNull()
    expect(await fetchProductByCategorySport("Jerseys Custom Designed", "(a+)+$")).toBeNull()
    expect(requestedPaths().some((path) => path.includes("/sport/"))).toBe(false)
  })

  it("does not show a product that was deactivated in the meantime", async () => {
    expect(await fetchProductByCategorySport("Jerseys Custom Designed", "volleyball")).toBeNull()
  })

  it("returns null when the backend can't be reached", async () => {
    fetchMock.mockRejectedValue(new Error("network down"))
    expect(await fetchProductByCategorySport("T-shirt Custom Designed", "polo-t-shirt")).toBeNull()
  })
})
