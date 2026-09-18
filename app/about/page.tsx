import { redirect } from "next/navigation"

// Superseded by the CMS-backed /gts-hub/about page. Kept as a redirect
// (rather than deleted) so old bookmarks/links still resolve.
export default function AboutRedirect() {
  redirect("/gts-hub/about")
}
