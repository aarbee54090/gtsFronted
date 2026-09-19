import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | GTS",
  description: "Enter your GTS order ID to check the status of your custom sportswear order.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
