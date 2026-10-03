import { NextResponse, type NextRequest } from "next/server";

// Next's router percent-decodes dynamic route segments itself and answers a
// malformed encoding (e.g. /customize/%E0%A4%A, usually a bot or a mangled
// link) with a bare "Internal Server Error" before any page code runs. Such a
// URL can't name anything on the site, so serve the normal 404 page instead.
export function proxy(request: NextRequest) {
  try {
    decodeURIComponent(request.nextUrl.pathname);
    return NextResponse.next();
  } catch {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
}

// Only the sections with dynamic segments - static routes already 404 cleanly.
export const config = {
  matcher: ["/customize/:path*", "/gts-hub/:path*", "/appointments/:path*"],
};
