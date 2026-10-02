import { permanentRedirect } from "next/navigation"

// Superseded by the CMS-backed /gts-hub/about page. Kept as a redirect
// (rather than deleted) so old bookmarks/links still resolve - a permanent
// (308) one, since the move is final and search engines should transfer the
// old URL's signals to the new page.
export default function AboutRedirect() {
  permanentRedirect("/gts-hub/about")
}
