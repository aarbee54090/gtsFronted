import Script from "next/script";

// Google Analytics 4 (gtag.js). Mounted once in the root layout.
//
// - The Measurement ID comes from NEXT_PUBLIC_GA_ID. If it is unset or blank
//   (local dev, Preview deployments), nothing is rendered and no request is
//   made to Google, so test traffic never reaches the production property.
// - strategy="afterInteractive" loads gtag.js after hydration, so it does not
//   delay first paint or interactivity.
// - Both scripts carry a fixed `id`, which lets next/script de-duplicate them,
//   and the layout never remounts, so the tag initialises exactly once.
// - Page views: gtag("config") sends the first one. Client-side route changes
//   are reported by GA4 Enhanced Measurement ("Page changes based on browser
//   history events"), so no manual page_view call is made here - adding one
//   would double count.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(GA_ID)});`}
      </Script>
    </>
  );
}