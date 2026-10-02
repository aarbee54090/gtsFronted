import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Short, guessable addresses for pages that live under /gts-hub. Each is a
  // permanent redirect to the one canonical URL (already indexed and in the
  // sitemap), so there's never a duplicate page.
  redirects() {
    return [
      { source: "/our-work", destination: "/gts-hub/portfolio", permanent: true },
      { source: "/our-work/:slug", destination: "/gts-hub/portfolio/:slug", permanent: true },
      { source: "/portfolio", destination: "/gts-hub/portfolio", permanent: true },
      { source: "/portfolio/:slug", destination: "/gts-hub/portfolio/:slug", permanent: true },
      { source: "/contact", destination: "/gts-hub/contact", permanent: true },
      { source: "/book-a-visit", destination: "/gts-hub/contact", permanent: true },
    ];
  },
};

export default nextConfig;
