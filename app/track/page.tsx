import { redirect } from "next/navigation"

// Track Order was merged into the account system - order history now lives
// behind login at /account/orders (see the Navbar/ProfileMenu changes).
// This redirect keeps any old bookmarked/shared /track links working.
export default function TrackOrderRedirect() {
  redirect("/account/orders")
}
