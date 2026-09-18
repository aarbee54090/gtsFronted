import type { Metadata } from "next";
import "./globals.css";
import { CustomerAuthProvider } from "@/components/account/CustomerAuthContext";
import { SavedDesignsProvider } from "@/components/account/SavedDesignsContext";
import { SITE_URL } from "@/lib/site";

const title = "GTS — Custom Team Sportswear";
const description = "Design custom jerseys, tracksuits, hoodies, and gym wear for your team, college, or company.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "GTS",
    images: ["/images/gts-logo.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/gts-logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CustomerAuthProvider>
          <SavedDesignsProvider>{children}</SavedDesignsProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
