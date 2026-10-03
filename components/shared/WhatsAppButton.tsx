"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { whatsappLink } from "@/lib/site"

/** Marks an on-page WhatsApp link; the floating button steps aside while one is on screen. */
export const WHATSAPP_CTA_ATTRIBUTE = "data-whatsapp-cta"

/**
 * Floating WhatsApp shortcut. Compact on phones (48px, in the corner, clear
 * of the iPhone home indicator), and hidden while one of the page's own
 * WhatsApp buttons is visible - so on the homepage it never sits on top of
 * "Start Customizing", and there's never a second WhatsApp button on screen.
 */
export function WhatsAppButton({ number }: { number?: string | null }) {
  // Hidden until the first check, so it never flashes over the hero.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const targets = [...document.querySelectorAll(`[${WHATSAPP_CTA_ATTRIBUTE}]`)]
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(frame)
    }
    const onScreen = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target)
        else onScreen.delete(entry.target)
      }
      setVisible(onScreen.size === 0)
    })
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <a
      href={whatsappLink(number, "Hi GoalThali Sports, I'd like to ask about custom sportswear.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with GoalThali Sports on WhatsApp"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-200 hover:scale-105 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" fill="white" strokeWidth={0} aria-hidden="true" />
    </a>
  )
}
