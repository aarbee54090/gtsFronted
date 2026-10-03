/**
 * Next passes dynamic route segments through still percent-encoded. Decodes
 * one, returning null for malformed input (e.g. "%E0%A4%A") instead of
 * letting decodeURIComponent throw a URIError - callers turn null into a 404.
 */
export function decodeRouteParam(raw: string): string | null {
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}
