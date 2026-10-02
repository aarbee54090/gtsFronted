import { describe, expect, it } from "vitest"
import { cleanImageUrl, distinctMobileUrl } from "@/lib/images"
import { usableImageUrl } from "@/lib/seo"

const URL_A = "https://res.cloudinary.com/dtgh5unm5/image/upload/v1777586116/bs-48_ciil6y.png"

describe("cleanImageUrl", () => {
  it("keeps a normal URL", () => {
    expect(cleanImageUrl(URL_A)).toBe(URL_A)
    expect(cleanImageUrl(`  ${URL_A}  `)).toBe(URL_A)
  })

  it("reduces a link pasted twice (the live T-shirt design 'A') to the one URL", () => {
    expect(cleanImageUrl(`${URL_A}${URL_A}`)).toBe(URL_A)
    expect(cleanImageUrl(`${URL_A} ${URL_A}`)).toBe(URL_A)
    expect(usableImageUrl(`${URL_A}${URL_A}`)).toBe(URL_A)
  })

  it("drops anything that isn't an http(s) URL", () => {
    expect(cleanImageUrl("")).toBeUndefined()
    expect(cleanImageUrl(undefined)).toBeUndefined()
    expect(cleanImageUrl("javascript:alert(1)")).toBeUndefined()
    expect(cleanImageUrl("res.cloudinary.com/x.png")).toBeUndefined()
  })
})

describe("distinctMobileUrl", () => {
  it("only returns a mobile image that is actually different", () => {
    expect(distinctMobileUrl(URL_A, URL_A)).toBeUndefined()
    expect(distinctMobileUrl(URL_A, `${URL_A}${URL_A}`)).toBeUndefined()
    expect(distinctMobileUrl(URL_A, "https://res.cloudinary.com/demo/image/upload/m.png")).toBe(
      "https://res.cloudinary.com/demo/image/upload/m.png"
    )
    expect(distinctMobileUrl(URL_A, undefined)).toBeUndefined()
  })
})
