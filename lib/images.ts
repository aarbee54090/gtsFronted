/**
 * The usable image URL in an admin-entered field, or undefined.
 *
 * Admins paste Cloudinary links by hand, and a second paste into the same
 * field leaves "https://.../a.pnghttps://.../a.png" - one URL typed twice,
 * which loads as a broken image. That keeps the first URL (it's the same
 * address, not a guess). Anything that isn't an http(s) URL is dropped.
 */
export function cleanImageUrl(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const second = trimmed.slice(8).search(/https?:\/\//i)
  const first = second === -1 ? trimmed : trimmed.slice(0, second + 8)
  const url = first.split(/\s/)[0]
  return /^https?:\/\/\S+$/i.test(url) ? url : undefined
}

/**
 * A separate mobile image only when it's really different from the desktop
 * one - several CMS records repeat the same URL in both fields, which would
 * otherwise be treated as two images.
 */
export function distinctMobileUrl(desktop: string | undefined, mobile: string | undefined): string | undefined {
  const cleanDesktop = cleanImageUrl(desktop)
  const cleanMobile = cleanImageUrl(mobile)
  return cleanMobile && cleanMobile !== cleanDesktop ? cleanMobile : undefined
}
