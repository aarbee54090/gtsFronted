import { describe, it, expect } from "vitest"
import type { ContactInfo } from "@/lib/contact-types"
import { directionsUrl, formatAddress, mapEmbedSrc } from "@/lib/contact"
import { localBusinessNode, organizationNode } from "@/lib/structured-data"
import { SITE_URL, internationalPhone, telLink, whatsappLink } from "@/lib/site"
import { projectClient, projectImageAlt, similarDesignLink } from "@/lib/our-work"
import type { AdminProduct } from "@/lib/admin-types"
import { tidyIfLowercase } from "@/lib/text"

const LIVE_CONTACT: ContactInfo = {
  _id: "c1",
  address: "kalanki kathmandu",
  email: "goalthalisports@gmail.com",
  phone: "9705743117",
  whatsapp: "+9779705743117",
  // As stored today: the src followed by the rest of the pasted <iframe> tag.
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m14!2sGoalthali%20Sports-(GTS)!5e0" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin',
}

describe("site URL", () => {
  it("defaults to the www host the apex redirects to", () => {
    expect(SITE_URL).toBe("https://www.goalthalisports.com")
  })
})

describe("contact helpers", () => {
  it("tidies the free-text address and prefers structured fields", () => {
    expect(formatAddress(LIVE_CONTACT)).toBe("Kalanki Kathmandu")
    expect(formatAddress({ ...LIVE_CONTACT, streetAddress: "Kalanki", addressLocality: "Kathmandu" })).toBe("Kalanki, Kathmandu, Nepal")
    expect(formatAddress(null)).toBeNull()
  })

  it("keeps only the URL from a pasted map embed, and only Google Maps", () => {
    expect(mapEmbedSrc(LIVE_CONTACT.mapEmbedUrl)).toBe("https://www.google.com/maps/embed?pb=!1m14!2sGoalthali%20Sports-(GTS)!5e0")
    expect(mapEmbedSrc('<iframe src="https://www.google.com/maps/embed?pb=x" width="1"></iframe>')).toBe("https://www.google.com/maps/embed?pb=x")
    expect(mapEmbedSrc("https://evil.example/maps/embed?pb=x")).toBeNull()
    expect(mapEmbedSrc("javascript:alert(1)")).toBeNull()
    expect(directionsUrl({ ...LIVE_CONTACT, mapsUrl: "javascript:alert(1)" })).toBeNull()
  })

  it("builds wa.me and tel links in international form", () => {
    expect(whatsappLink("+977 970-574-3117")).toBe("https://wa.me/9779705743117")
    expect(whatsappLink(undefined, "Hi")).toBe("https://wa.me/9779705743117?text=Hi")
    expect(telLink("9705743117")).toBe("tel:+9779705743117")
    expect(internationalPhone("+9779705743117")).toBe("+9779705743117")
  })
})

describe("structured data", () => {
  it("Organization carries the published phone and email, and no guessed address", () => {
    const org = organizationNode(["https://www.instagram.com/goalthalisports7"], LIVE_CONTACT)
    expect(org.telephone).toBe("+9779705743117")
    expect(org.email).toBe("goalthalisports@gmail.com")
    expect(org.address).toEqual({ "@type": "PostalAddress", addressCountry: "NP" })
    expect(JSON.stringify(org)).not.toMatch(/aggregateRating|review|ratingValue/i)
  })

  it("LocalBusiness only appears once a real locality is entered", () => {
    expect(localBusinessNode(LIVE_CONTACT)).toBeNull()
    const node = localBusinessNode({ ...LIVE_CONTACT, streetAddress: "Kalanki", addressLocality: "Kathmandu", addressRegion: "Bagmati", mapsUrl: "https://maps.app.goo.gl/abc" })
    expect(node).toMatchObject({
      "@type": "LocalBusiness",
      name: "GoalThali Sports",
      telephone: "+9779705743117",
      hasMap: "https://maps.app.goo.gl/abc",
      address: { streetAddress: "Kalanki", addressLocality: "Kathmandu", addressRegion: "Bagmati", addressCountry: "NP" },
    })
    expect(JSON.stringify(node)).not.toMatch(/aggregateRating|review|openingHours/i)
  })
})

describe("Our Work helpers", () => {
  const products = [
    { _id: "p1", name: "Basketball Custom Designs", category: "Jerseys Custom Designed", sport: "Basketball" },
    { _id: "p2", name: "Football Custom Design jersey", category: "Jerseys Custom Designed", sport: "Football" },
    { _id: "p3", name: "T-shirt", category: "T-shirt Custom Designed", sport: "t-shirt" },
  ]

  it("links a project to its sport's design gallery", () => {
    expect(similarDesignLink({ sport: "Basketball", productType: "Jersey Kit" }, products, null)).toEqual({
      href: "/customize/Jerseys%20Custom%20Designed/basketball",
      label: "Create a similar design",
    })
  })

  it("links straight to the catalog design a project was built from, if it still exists", () => {
    const used = {
      _id: "p2",
      name: "Football Custom Design jersey",
      category: "Jerseys Custom Designed",
      sport: "Football",
      designs: [{ _id: "d9", name: "Red Wave", imageUrl: "x" }],
      pricingTiers: [],
      isActive: true,
    } satisfies AdminProduct
    expect(similarDesignLink({ sport: "Football", usedDesign: { productId: "p2", designId: "d9" } }, products, used).href).toBe(
      "/customize/Jerseys%20Custom%20Designed/football/d9"
    )
    // A design that's since been removed falls back to the sport's gallery.
    expect(similarDesignLink({ sport: "Football", usedDesign: { productId: "p2", designId: "gone" } }, products, used).href).toBe(
      "/customize/Jerseys%20Custom%20Designed/football"
    )
  })

  it("falls back to all products when the sport isn't in the catalog", () => {
    expect(similarDesignLink({ sport: "Kabaddi" }, products, null).href).toBe("/products")
    expect(similarDesignLink({}, products, null).href).toBe("/products")
  })

  it("doesn't repeat a private individual's name", () => {
    expect(projectClient({ organizationName: "KRITIKA", organizationType: "Individual" })).toBe("Individual order")
    expect(projectClient({ organizationName: "Sewa Sadan School", organizationType: "School" })).toBe("Sewa Sadan School · School")
  })

  it("replaces meaningless alt text with a description", () => {
    expect(projectImageAlt({ url: "x", type: "image", alt: "image" }, "Team RAYZRS", "finished kit", 2)).toBe("Team RAYZRS - finished kit, photo 3")
    expect(projectImageAlt({ url: "x", type: "image", alt: "" }, "Team RAYZRS", "finished kit", 0)).toBe("Team RAYZRS - finished kit, photo 1")
    expect(projectImageAlt({ url: "x", type: "image", alt: "Team logo focus" }, "Team RAYZRS", "finished kit", 0)).toBe("Team RAYZRS - Team logo focus")
  })

  it("tidies all-lowercase titles only", () => {
    expect(tidyIfLowercase("blue dragon custom jersey")).toBe("Blue Dragon Custom Jersey")
    expect(tidyIfLowercase("Team RAYZRS kit")).toBe("Team RAYZRS kit")
  })
})
