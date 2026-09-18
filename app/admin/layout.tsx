import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";

// Admin screens carry no public content and sit behind a key gate at
// runtime (see AdminGate) plus requireAdmin on every backend route. This
// keeps them out of search results too - noindex is not the access
// control, it just stops Google from listing an internal tool.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
