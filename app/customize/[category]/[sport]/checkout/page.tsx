import type { Metadata } from "next"
import { CheckoutPage } from "@/components/customize/CheckoutPage"

// Transactional step with no unique public content - kept out of search
// results the same way /admin and /account are.
export const metadata: Metadata = {
  title: "Checkout | GoalThali Sports",
  robots: { index: false, follow: false },
}

export default function Checkout() {
  return (
    <>
      <div className="mx-auto max-w-[700px] px-6 pb-24 pt-32">
        <CheckoutPage />
      </div>
    </>
  )
}
