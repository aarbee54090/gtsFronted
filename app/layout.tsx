import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { CustomerAuthProvider } from "@/components/account/CustomerAuthContext";
import { SavedDesignsProvider } from "@/components/account/SavedDesignsContext";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION } from "@/lib/seo";

// Body copy and UI. Variable font: one file covers every weight.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Headings - condensed sportswear caps, in keeping with the GTS wordmark.
// Exactly the two cuts the type scale uses (one file each): upright 700 for
// page and section headings, italic 800 for the homepage hero statement.
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: "700",
  style: "normal",
  variable: "--font-barlow",
  display: "swap",
});
const barlowItalic = Barlow_Condensed({
  subsets: ["latin"],
  weight: "800",
  style: "italic",
  variable: "--font-barlow-italic",
  display: "swap",
});

// Site-wide defaults only. Indexable pages set their own title, description,
// canonical, and social tags through pageMetadata() (lib/seo.ts). Nothing
// here may be page-specific: Next replaces nested objects like openGraph
// rather than merging them, so pages that don't set their own (account,
// checkout, ...) inherit these as-is - which is also why there's no
// canonical or og:url here, as either would point those pages at the
// homepage. Icons come from the file conventions (favicon.ico, icon.png,
// apple-icon.png in this folder).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE],
  },
  // Google Search Console's HTML-tag verification, if the owner verifies that
  // way (a DNS-verified domain property needs nothing here). The token is
  // public by design - it's printed in every page's <head>.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#0b0d0f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${barlowItalic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CustomerAuthProvider>
          <SavedDesignsProvider>{children}</SavedDesignsProvider>
        </CustomerAuthProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}