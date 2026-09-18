"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Shirt,
  Sliders,
  Calculator,
  Wallet,
  Hammer,
  Search,
  PackageCheck,
  ChevronDown,
} from "lucide-react"

const STEPS = [
  {
    icon: Shirt,
    title: "Choose Design",
    hint: "Pick a sport & design, or upload your own",
    detail:
      "Browse by category and sport, choose from our design catalog, or upload your own artwork.",
  },
  {
    icon: Sliders,
    title: "Customize",
    hint: "Sleeve, collar, addons & more",
    detail:
      "Sleeve and collar styles, addons like shorts or tracksuits, plus optional player names, numbers, and sizes.",
  },
  {
    icon: Calculator,
    title: "See Price",
    hint: "Updates live as you build",
    detail: "Your price updates live as you customize — no back-and-forth needed.",
  },
  {
    icon: Wallet,
    title: "Pay Advance",
    hint: "Just 40% to get started",
    detail: "Place your order with a 40% advance payment; the rest is due once it's ready.",
  },
  {
    icon: Hammer,
    title: "We Produce",
    hint: "Approved, then made",
    detail: "Your order is reviewed and approved, then goes into production.",
  },
  {
    icon: Search,
    title: "Track Order",
    hint: "Anytime, with your Order ID",
    detail: "Use your Order ID anytime to check your order's status.",
  },
  {
    icon: PackageCheck,
    title: "Get Your Kit",
    hint: "Pay balance & receive",
    detail: "The remaining 60% is due once your gear is ready.",
  },
]

export function Process() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="process" className="mx-auto max-w-[720px] px-6 py-16 sm:py-24">
      <div className="mb-10 text-center sm:mb-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand-green)]">
          Process
        </p>
        <h2 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          From idea to jersey, in 7 steps
        </h2>
        <p className="mt-3 text-sm text-[var(--color-text-gray)]">Tap any step for more detail</p>
      </div>

      <ol className="relative list-none p-0">
        {STEPS.map((step, i) => {
          const isOpen = openIndex === i
          const isLast = i === STEPS.length - 1

          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-6 top-14 h-[calc(100%-2rem)] w-px bg-[var(--glass-border)]"
                />
              )}

              <motion.span
                aria-hidden="true"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
                className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-[0_0_0_1px_var(--glass-border)]"
              >
                <step.icon className="h-6 w-6" strokeWidth={2} />
              </motion.span>

              <div className="flex-1 pt-1">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-gray)]">Step {i + 1}</p>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-[var(--color-text-gray)]">{step.hint}</p>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-[var(--color-text-gray)]"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-2 text-sm text-[var(--color-text-gray)]">{step.detail}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
