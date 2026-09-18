import type { Metadata } from "next";
import "./globals.css";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CustomerAuthProvider } from "@/components/account/CustomerAuthContext";
import { SavedDesignsProvider } from "@/components/account/SavedDesignsContext";

export const metadata: Metadata = {
  title: "GTS — Custom Team Sportswear",
  description: "Design custom jerseys, tracksuits, hoodies, and gym wear for your team, college, or company.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CustomerAuthProvider>
          <SavedDesignsProvider>
            {children}
            <WhatsAppButton />
          </SavedDesignsProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
